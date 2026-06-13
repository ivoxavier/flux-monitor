FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["FluxMonitor.Api/FluxMonitor.Api.csproj", "FluxMonitor.Api/"]
COPY ["FluxMonitor.Application/FluxMonitor.Application.csproj", "FluxMonitor.Application/"]
COPY ["FluxMonitor.Domain/FluxMonitor.Domain.csproj", "FluxMonitor.Domain/"]
COPY ["FluxMonitor.Infrastructure/FluxMonitor.Infrastructure.csproj", "FluxMonitor.Infrastructure/"]
RUN dotnet restore "FluxMonitor.Api/FluxMonitor.Api.csproj"

COPY . .
WORKDIR "/src/FluxMonitor.Api"
RUN dotnet publish "FluxMonitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "FluxMonitor.Api.dll"]