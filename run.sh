#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ ! -f .env.local ]; then
    echo -e "${RED}[Error] The .env.local file was not found in the root directory!${NC}"
    echo -e "${YELLOW}Please create the file before running this script (e.g., cp .env.example .env.local)${NC}"
    exit 1
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}          FluxMonitor - Orchestration CLI         ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo "Select the desired execution mode (Using .env.local):"
echo "1) [Local Pure]  - Local Frontend + Local Backend (No Docker)"
echo "2) [Hybrid Mode] - Local Frontend + Local Backend + DB in Docker"
echo "3) [Full Docker] - Everything in Isolated Containers (Full Stack)"
echo "4) [Docker Down] - Stop and clean all Docker containers"
echo "5) Exit"
echo -e "${BLUE}--------------------------------------------------${NC}"
read -p "Option (1-5): " opcao

case $opcao in
    1)
        echo -e "\n${GREEN}[=>] Starting in Pure Local mode...${NC}"
        echo -e "${YELLOW}[!] Ensure your local MySQL service is active on your machine.${NC}"
        
        pnpm install
        pnpm dev:front &
        dotnet run --project back-end/FluxMonitor.Api/
        ;;
    2)
        echo -e "\n${GREEN}[=>] Starting in Hybrid mode...${NC}"
        echo -e "${BLUE}[=>] Booting the Database in Docker...${NC}"
        
        docker compose --env-file .env.local up -d flux-monitor-db
        
        echo -e "${GREEN}[=>] Database is ready. Launching local applications...${NC}"
        pnpm install
        pnpm dev:front &
        dotnet run --project back-end/FluxMonitor.Api/
        ;;
    3)
        echo -e "\n${GREEN}[=>] Starting in Full Containerized mode (Docker)...${NC}"
        echo -e "${YELLOW}[!] Make sure Docker Desktop is open and running.${NC}"
        
        docker compose --env-file .env.local up --build
        ;;
    4)
        echo -e "\n${RED}[=>] Destroying Docker infrastructure...${NC}"
        docker compose --env-file .env.local down -v
        echo -e "${GREEN}[V] Docker environment cleaned successfully!${NC}"
        ;;
    5)
        echo -e "\n${BLUE}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "\n${RED}[Error] Invalid option!${NC}"
        exit 1
        ;;
esac