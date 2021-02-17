data "archive_file" "lambda" {
  type = "zip"
  source_file = "./lambda/index.js"
  output_path = "./lambda/lambda.zip"
}

resource "aws_lambda_function" "example_test_function" {
  filename = "${data.archive_file.lambda.output_path}"
  function_name = "example_test_function"
  role = "${aws_iam_role.example_api_role.arn}"
  handler = "index.handler"
  runtime = "nodejs4.3"
  source_code_hash = "${base64sha256(file("${data.archive_file.lambda.output_path}"))}"
  publish = true
}
