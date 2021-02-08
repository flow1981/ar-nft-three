# AWS main domain bucket (file storage)
resource "aws_s3_bucket" "website-root" {
  bucket = var.domain_name
  acl = "public-read"
  policy = data.aws_iam_policy_document.website_policy.json

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET"]
    allowed_origins = ["https://www.${var.domain_name}"]
    max_age_seconds = 3000
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

# AWS S3 bucket for www-redirect
resource "aws_s3_bucket" "website-redirect" {
  bucket = "www.${var.domain_name}"
  website {
    redirect_all_requests_to = "${aws_s3_bucket.website-root.id}"
  }
}
