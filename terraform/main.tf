terraform {
  required_version = "0.12.7"

  backend "s3" {
    bucket = "ar-nft-three-terraform-backend"
    region = "eu-west-3"
    key = "terraform.tfstate"
  }
}

data "local_file" "aws_region" {
  filename = ".aws-region"
}

provider "aws" {
  region = "eu-west-3"
}

provider "aws" {
  alias   = "acm_certificates_provider"
  region  = "us-east-1"
  # To use an ACM Certificate with CloudFront, we must request the certificate from the US East (N. Virginia) region.
}

module "static-website" {
  source = "./module/static-website"

  providers = {
    aws.aws = aws
    aws.acm_provider = aws.acm_certificates_provider
  }
}