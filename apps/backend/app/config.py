from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "iyagi-backend"
    app_env: str = "dev"

    postgres_host: str = "db"
    postgres_port: int = 5432
    postgres_user: str = "iyagi"
    postgres_password: str = "iyagi"
    postgres_db: str = "iyagi"

    redis_host: str = "redis"
    redis_port: int = 6379

    # LLM auth / project separation
    openai_api_key_simulation: str = ""
    openai_api_key_evaluation: str = ""
    openai_project_id_simulation: str = ""
    openai_project_id_evaluation: str = ""

    # environment-split key placeholders
    openai_api_key_dev: str = ""
    openai_api_key_staging: str = ""
    openai_api_key_prod_simulation: str = ""
    openai_api_key_prod_evaluation: str = ""
    openai_api_key_prod_admin: str = ""

    openai_model_scene_candidate: str = "gpt-4.1-mini"
    openai_model_scene_execution: str = "gpt-4.1-mini"

    llm_timeout_seconds: int = 12
    llm_retry_count: int = 2
    llm_max_output_tokens: int = 700

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
