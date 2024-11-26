import json
import logging


class LogJsonFormatter(logging.Formatter):
    """Logging Json formatter"""

    # properties on the Logging.Formater object + color_message
    def_keys = [
        "name",
        "msg",
        "args",
        "levelname",
        "levelno",
        "pathname",
        "filename",
        "module",
        "exc_info",
        "exc_text",
        "stack_info",
        "lineno",
        "funcName",
        "created",
        "msecs",
        "relativeCreated",
        "thread",
        "threadName",
        "processName",
        "process",
        "message",
        "color_message",
        "aws_request_id",
    ]

    def __init__(self, task_name=None):
        self.task_name = task_name
        super().__init__()

    def _remove_required_keys(self, extra):
        """Remove status and content from the extra so we don't override the message"""
        for key in ["status", "content"]:
            if key in extra:
                del extra[key]

        return extra

    def format(self, record):
        """Formate the log record"""
        # anything passed in extra is stored as a property of record. extra grabs all keys minus the ones defined above.
        extra = {k: v for k, v in record.__dict__.items() if k not in self.def_keys}

        data = {"status": record.levelname, "content": record.getMessage()}

        if len(extra) > 0:
            extra = self._remove_required_keys(extra)
            data = dict(list(data.items()) + list(extra.items()))

        return json.dumps(data)
