provider "aws" {
  alias   = "acm_certificates_provider"
  region  = "us-east-1" # To use an ACM Certificate with CloudFront, we must request the certificate from the US East (N. Virginia) region.
  version = "3.27"
  }

# ---------------------------------------------------------------------------------------------------------------------
# ACM public Certificate, validate via DNS

resource "aws_acm_certificate" "cert" {
  domain_name               = var.root_domain_name
  subject_alternative_names = [var.www_domain_name]

  provider          = aws.acm_certificates_provider
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
}

// Import the hosted zone details of our domain
data "aws_route53_zone" "root_domain" {
  name         = var.root_domain_name
  private_zone = false
}

// Setup record for DNS validation of certificate
resource "aws_route53_record" "cert_valication" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.root_domain.zone_id
}

# ---------------------------------------------------------------------------------------------------------------------
# Certificate validation request
# Provider docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate_validation

resource "aws_acm_certificate_validation" "cert_validation" {
  provider                = aws.acm_certificates_provider # ACM needs to be used in the "us-east-1" region
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_valication : record.fqdn]
}

// -------------
// This Route53 record will point at our CloudFront distribution.
resource "aws_route53_record" "www" {
  depends_on = [aws_cloudfront_distribution.s3_distribution]

  zone_id = data.aws_route53_zone.root_domain.zone_id
  name    = "${var.www_domain_name}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.s3_distribution.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.s3_distribution.hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  price_class = "PriceClass_100" #supporting only North Americas & Europe

  // origin is where CloudFront gets its content from.
  origin {
    // We need to set up a "custom" origin because otherwise CloudFront won't
    // redirect traffic from the root domain to the www domain, that is from
    // runatlantis.io to www.runatlantis.io.
    custom_origin_config {
      // These are all the defaults.
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    // Here we're using our S3 bucket's URL!
    domain_name = "${aws_s3_bucket.www.website_endpoint}"
    // This can be any name to identify this origin.
    origin_id   = "${var.www_domain_name}"
  }

  enabled             = true
  default_root_object = "index.html"

  // All values are defaults from the AWS console.
  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    // This needs to match the `origin_id` above.
    target_origin_id       = "${var.www_domain_name}"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  // Here we're ensuring we can hit this distribution using www.runatlantis.io
  // rather than the domain name CloudFront gives us.
  aliases = ["${var.www_domain_name}"]

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  // Here's where our certificate is loaded in!
  viewer_certificate {
    acm_certificate_arn = "${aws_acm_certificate.cert.arn}"
    ssl_support_method  = "sni-only"
  }
}

