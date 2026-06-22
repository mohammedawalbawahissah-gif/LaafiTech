from django.apps import AppConfig


class DistributionsConfig(AppConfig):
    name = "distributions"

    def ready(self):
        import distributions.signals  # noqa: F401 — registers signal receivers
