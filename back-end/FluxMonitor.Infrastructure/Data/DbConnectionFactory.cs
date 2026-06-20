using System.Data;
using Microsoft.Extensions.Configuration;
using MySqlConnector;

namespace FluxMonitor.Infrastructure.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public class MySqlDbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public MySqlDbConnectionFactory(IConfiguration configuration)
    {
        
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string is missing.");
    }

    public IDbConnection CreateConnection()
    {
        return new MySqlConnection(_connectionString);
    }
}