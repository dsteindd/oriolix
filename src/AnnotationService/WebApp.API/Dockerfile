FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y \
        nodejs \
    && rm -rf /var/lib/apt/lists/* 

WORKDIR /src
COPY WebApp.API/WebApp.API.csproj WebApp.API/
RUN dotnet restore "WebApp.API/WebApp.API.csproj"
COPY WebApp.API/ ./WebApp.API/
WORKDIR "/src/WebApp.API"
RUN dotnet build "WebApp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WebApp.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

COPY WebApp.API/assets/species.csv ./assets/species.csv

ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

ENTRYPOINT ["dotnet", "WebApp.API.dll"]
