provider "aws" {
  region = "eu-central-1"
}

resource "aws_elasticache_cluster" "shortener_redis" {
  cluster_id           = "shortener-redis-cluster"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  port                 = 6379

  # Specify the VPC security group here
  security_group_ids = [aws_security_group.shortener_redis_sg.id]
}

resource "aws_instance" "url-shortener" {
  ami                   = "ami-0183b16fc359a89dd" # Make sure this AMI is available in your region and supports your instance type
  instance_type         = "t3.micro"
  key_name              = "folababa" # Replace with your actual SSH key name

  # Ensure the instance is associated with the same security group as the Redis cluster
  vpc_security_group_ids = [aws_security_group.shortener_redis_sg.id]

  tags = {
    Name = "ExampleEC2Instance"
  }
}

resource "aws_security_group" "shortener_redis_sg" {
  name        = "shortener-redis-sg"
  description = "Allow inbound traffic for Redis and SSH"

  # Redis port
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Warning: This allows access from anywhere. Adjust accordingly.
  }

  # SSH port
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Adjust this to a more restricted range for better security
  }

  # Default rule to allow outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
