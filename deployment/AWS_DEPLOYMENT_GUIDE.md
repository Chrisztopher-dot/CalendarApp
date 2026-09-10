# AWS EC2 Deployment Guide: Personal Calendar Organizer

This guide provides step-by-step instructions to deploy and host the **Personal Calendar Organizer Web App** on an **AWS EC2** instance.

Because the app is built as an ultra-lightweight client-side SPA with zero complex backend (all user data is strictly partitioned in browser `localStorage`), you can host it smoothly on an **AWS Free Tier** eligible instance (such as `t3.micro` or `t4g.nano`) for \$0/month.

---

## Architecture Overview

```
 [ Client Browser ]
        │  ▲
        │  │  1. Fast Static Assets (HTML/JS/CSS, <100 KB gzipped)
        ▼  │
 ┌────────────────────────────────────────────────────────┐
 │ AWS EC2 Instance (t3.micro / t4g.nano)                 │
 │                                                        │
 │   ┌────────────────────────────────────────────────┐   │
 │   │  Nginx Web Server / Alpine Docker Container    │   │
 │   │  - Port 80 (HTTP) -> Port 443 (SSL/Certbot)    │   │
 │   │  - Static Asset Gzip Compression               │   │
 │   │  - SPA URL Fallback (try_files index.html)     │   │
 │   └────────────────────────────────────────────────┘   │
 └────────────────────────────────────────────────────────┘
        │
   No database server needed!
   All user data is stored safely and isolated inside the
   client browser's localStorage["organizerData_<email>"].
```

---

## Step 1: Launch an AWS EC2 Instance

1. Log in to your **AWS Management Console** and navigate to the **EC2 Dashboard**.
2. Click **Launch Instance**.
3. Configure the instance:
   - **Name**: `calendar-organizer`
   - **Application and OS Images (AMI)**: Select **Amazon Linux 2023 AMI** or **Ubuntu Server 24.04 LTS**.
   - **Architecture**: `64-bit (x86)` (or `Arm / Graviton` if using `t4g.nano`).
   - **Instance Type**: `t3.micro` (or `t4g.nano`) — **Free tier eligible**.
   - **Key Pair**: Select your existing SSH key pair or create a new one (e.g. `organizer-key.pem`).
4. **Network Settings (Security Group)**:
   - Allow **SSH traffic from**: `My IP` (Port 22)
   - Allow **HTTP traffic from the internet**: `Anywhere (0.0.0.0/0)` (Port 80)
   - Allow **HTTPS traffic from the internet**: `Anywhere (0.0.0.0/0)` (Port 443)
5. *(Optional)* Expand **Advanced Details** and paste the content of `deployment/ec2-user-data.sh` into the **User Data** field to automatically install Docker on boot.
6. Click **Launch Instance**.

---

## Step 2: Connect to Your EC2 Instance via SSH

Once the instance reaches the `Running` state, note its **Public IPv4 Address** (e.g. `54.123.45.67`).

From your local terminal:
```bash
# Set proper permissions for your key
chmod 400 organizer-key.pem

# Connect (for Amazon Linux)
ssh -i "organizer-key.pem" ec2-user@<YOUR-EC2-PUBLIC-IP>

# Or (for Ubuntu)
ssh -i "organizer-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

## Step 3: Deploy the Application

Choose **Option A** (Docker - recommended) or **Option B** (Native Nginx).

### Option A: Deploy via Docker (Recommended)

1. **Install Docker and Docker Compose** (if not already installed via User Data):
   ```bash
   # Amazon Linux 2023:
   sudo dnf update -y && sudo dnf install -y docker git
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   newgrp docker

   # Install compose plugin
   mkdir -p ~/.docker/cli-plugins/
   curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-$(uname -m) -o ~/.docker/cli-plugins/docker-compose
   chmod +x ~/.docker/cli-plugins/docker-compose
   ```

2. **Copy or Clone Your Project to the EC2 Instance**:
   You can push your project to GitHub/GitLab and clone it, or upload it using SCP:
   ```bash
   # Example git clone:
   git clone <YOUR-REPOSITORY-URL> app
   cd app
   ```
   *(Or upload the folder directly from your local machine via SCP)*:
   ```bash
   scp -i organizer-key.pem -r /Users/ChrisZwork/CalendarApp2 ec2-user@<YOUR-EC2-PUBLIC-IP>:~/app
   ```

3. **Start the App with Docker Compose**:
   ```bash
   cd ~/app/deployment
   docker compose up -d --build
   ```

4. **Verify**:
   ```bash
   docker ps
   ```
   You should see `calendar-organizer-app` running and listening on port `0.0.0.0:80->80/tcp`.

---

### Option B: Deploy via Native Nginx (Without Docker)

If you prefer not to use Docker:

1. **Build the production assets locally or on EC2**:
   ```bash
   # Build locally:
   npm run build
   # This generates the self-contained dist/ folder
   ```

2. **Install Nginx on EC2**:
   ```bash
   # Amazon Linux 2023:
   sudo dnf install -y nginx
   sudo systemctl enable --now nginx

   # Ubuntu:
   sudo apt update && sudo apt install -y nginx
   sudo systemctl enable --now nginx
   ```

3. **Copy the built `dist/` files to `/var/www/calendar-app`**:
   ```bash
   sudo mkdir -p /var/www/calendar-app
   sudo cp -r dist/* /var/www/calendar-app/
   ```

4. **Configure Nginx**:
   Create `/etc/nginx/conf.d/calendar.conf`:
   ```nginx
   server {
       listen 80;
       server_name _;

       root /var/www/calendar-app;
       index index.html;

       gzip on;
       gzip_types text/plain text/css application/json application/javascript image/svg+xml;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(?:css|js|woff2?|svg|png|jpg|jpeg|gif|ico)$ {
           expires 1y;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }
   }
   ```

5. **Test and reload Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Step 4: Access Your Application

Open your browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>
```

You will be greeted with the **Personal Organizer** interface! You can immediately:
- Click **"Öppna Demoläge direkt"** to test with rich Swedish calendar data, mood curves, and goals.
- Or create a personal account with your email and password.

---

## Step 5: (Optional) Custom Domain & Free HTTPS with Let's Encrypt

To run your calendar organizer under your own domain (e.g., `https://calendar.yourdomain.com`):

1. In your DNS provider (e.g. AWS Route 53, Cloudflare, Namecheap), add an **A record**:
   - **Name**: `calendar` (or `@`)
   - **Value**: Your EC2 instance public IP.
2. Install **Certbot** on your EC2 instance:
   ```bash
   # Amazon Linux 2023:
   sudo dnf install -y python3-certbot-nginx
   sudo certbot --nginx -d calendar.yourdomain.com

   # Ubuntu:
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d calendar.yourdomain.com
   ```
3. Follow the prompt to input your email. Certbot automatically configures HTTPS and sets up auto-renewal cron jobs!

---

## Step 6: Updates & Continuous Maintenance

To deploy an update after making code changes:
```bash
cd ~/app
git pull
cd deployment
docker compose up -d --build
```
Zero downtime, instant update!
