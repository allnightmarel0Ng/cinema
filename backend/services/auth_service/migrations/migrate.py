# import logging
# import yaml
# from sqlalchemy import inspect
# from app.database import Base, engine
# from app.models import User

# logger = logging.getLogger("migration_logger")
# logger.setLevel(logging.INFO)

# with open("../../deploy/grafana/provisioning/datasources/datasources.yml", "r") as file:
#     datasources = yaml.safe_load(file)

# from deploy.grafana.provisioning.datasources import datasources
# loki_handler = LokiHandler(
#     url="http://loki:3100/loki/api/v1/push",
#     tags={"job": "db_migration", "env": "dev"}
# )
# logger.addHandler(loki_handler)

# async def migrate():
#     logger.info("Starting migration...")
#     async with engine.begin() as conn:
#         def sync_inspect(connection):
#             inspector = inspect(connection)
#             return inspector.has_table("users")

#         try:
#             has_users_table = await conn.run_sync(sync_inspect)
#         except Exception as e:
#             logger.error(f"Failed to inspect database: {e}")
#             return

#         if not has_users_table:
#             logger.info("Table 'users' not found. Creating tables...")
#             try:
#                 await conn.run_sync(Base.metadata.create_all)
#                 logger.info("Tables created successfully.")
#             except Exception as e:
#                 logger.error(f"Error while creating tables: {e}")
#         else:
#             logger.info("Tables already exist. Skipping creation.")

# if __name__ == "__main__":
#     import asyncio
#     logger.info("Running migrate()...")
#     asyncio.run(migrate())
from sqlalchemy import inspect
from app.database import Base, engine
from app.models import User

async def migrate():
    async with engine.begin() as conn:
        def sync_inspect(connection):
            inspector = inspect(connection)
            return inspector.has_table("users")
        has_users_table = await conn.run_sync(sync_inspect)
        
        if not has_users_table:
            print("Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("Tables created")
        else:
            print("Tables already exist")

if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate())