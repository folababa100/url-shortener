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

resource "aws_security_group" "shortener_redis_sg" {
  name        = "shortener-redis-sg"
  description = "Allow inbound traffic for Redis"

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Warning: This allows access from anywhere. Adjust accordingly.
  }
}
