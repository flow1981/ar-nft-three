# AWS main domain bucket (file storage)
resource "aws_s3_bucket" "www" {
  // Our bucket's name is going to be the same as our site's domain name.
  bucket = "${var.www_domain_name}"
  // Because we want our site to be available on the internet, we set this so
  // anyone can read this bucket.
  acl    = "public-read"
  // We also need to create a policy that allows anyone to view the content.
  // This is basically duplicating what we did in the ACL but it's required by
  // AWS. This post: http://amzn.to/2Fa04ul explains why.
  policy = <<POLICY
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"AddPerm",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${var.www_domain_name}/*"]
    }
  ]
}
POLICY

  // S3 understands what it means to host a website.
  website {
    // Here we tell S3 what to use when a request comes in to the root
    // ex. https://www.runatlantis.io
    index_document = "index.html"
    // The page to serve up if a request results in an error or a non-existing
    // page.
    error_document = "404.html"
  }
}

# resource "aws_s3_bucket" "website_root" {
#   bucket = var.domain_name
#   acl = "public-read"

#   website {
#     index_document = "index.html"
#     error_document = "index.html"
#   }
# }

# # AWS S3 bucket for www-redirect
# resource "aws_s3_bucket" "website_redirect" {
#   bucket = "www.${var.domain_name}"

#   website {
#     redirect_all_requests_to = "${aws_s3_bucket.website_root.id}"
#   }
# }

# resource "aws_s3_bucket_policy" "plcy" {
#   bucket = "${aws_s3_bucket.website_root.id}"
#   policy = <<POLICY
# {
#   "Version": "2008-10-17",
#   "Id": "Policy1380877762691",
#   "Statement": [
#     {
#         "Sid": "Stmt1380877761162",
#         "Effect": "Allow",
#         "Principal": {
#             "AWS": "*"
#         },
#         "Action": "s3:GetObject",
#         "Resource": "arn:aws:s3:::${var.domain_name}/*"
#     }
#   ]
# }
#   POLICY
# }
