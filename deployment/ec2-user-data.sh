#!/bin/bash
# ==============================================================================
# AWS EC2 Cloud-Init / User Data Bootstrap Script
# Automatically sets up Docker and launches the Calendar Organizer SPA
# Compatible with Amazon Linux 2023 and Ubuntu 22.04/24.04 LTS
# ==============================================================================

set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo ">>> Starting Calendar Organizer EC2 Auto-Provisioning..."

# Detect Operating System
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

echo ">>> Detected OS: $OS"

if [ "$OS" = "amzn" ]; then
    # Amazon Linux 2023
    dnf update -y
    dnf install -y docker git
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    # Install Docker Compose Plugin
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

elif [ "$OS" = "ubuntu" ]; then
    # Ubuntu LTS
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg git
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
fi

echo ">>> Docker successfully installed and running."

# Directory for the application
APP_DIR="/opt/calendar-app"
mkdir -p $APP_DIR

# (If your code is in a Git repository, you can git clone it here:)
# git clone https://github.com/your-username/your-repo.git $APP_DIR
# cd $APP_DIR/deployment
# docker compose up -d --build

echo ">>> EC2 instance is pre-configured and ready for application deployment!"
