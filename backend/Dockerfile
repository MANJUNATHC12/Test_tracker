# ---------- Build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY TestingTracker.Api.csproj ./
RUN dotnet restore "TestingTracker.Api.csproj"

# copy everything else and build
COPY . .
RUN dotnet publish "TestingTracker.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- Runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 5115
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TestingTracker.Api.dll"]