//remote backend is terraformed with terraform/init folder
terraform {
  required_version = ">= 0.12"
  backend "s3" {
    bucket = "terraform-state-ar-nft-three"
    region = "eu-west-3"
    key = "terraform.tfstate"
  }
}

data "local_file" "aws_region" {
  filename = ".aws-region"
}

data "aws_route53_zone" "selected" {
  name         = "ar-iss-tracker.info"
}

provider "aws" {
  region  = data.local_file.aws_region.content
  version = "3.27"
}

provider "aws" {
  alias   = "acm_certificates_provider"
  region  = "us-east-1"
  version = "3.27"
  # To use an ACM Certificate with CloudFront, we must request the certificate from the US East (N. Virginia) region.
}


module "ar-nft-three" {
  source = "../modules/static-website"

  providers = {
    aws              = aws
    aws.acm_provider = aws.acm_certificates_provider
  }

  root_domain_name   = "ar-iss-tracker.info"
  www_domain_name    = "www.ar-iss-tracker.info"
}