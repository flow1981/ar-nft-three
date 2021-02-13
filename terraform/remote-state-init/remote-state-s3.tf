//used to initialize the remote backend for the environment

provider "aws" {
  region = "eu-west-3"
}

resource "aws_s3_bucket" "terraform-state-backend" {
    bucket = "terraform-state-ar-nft-three"
    acl    = "private"
    versioning {
      enabled = true
    }
    lifecycle {
      prevent_destroy = true
    } 
}