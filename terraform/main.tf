terraform {

  backend "s3" {
    bucket = "terraform-state-ar-nft-three"
    region = "eu-west-3"
    key = "terraform.tfstate"
  }
}

data "local_file" "aws_region" {
  filename = ".aws-region"
}

provider "aws" {
  region  = data.local_file.aws_region.content
}

module "ar-nft-three" {
  source = "./module/static-website"

  providers = {
    aws              = aws
  }

  domain_name = "test"
}