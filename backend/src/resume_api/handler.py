"""AWS Lambda entry point (see sst.config.ts)."""

from mangum import Mangum

from resume_api.main import app

# No startup or shutdown hooks to run, so skip the lifespan handshake.
handler = Mangum(app, lifespan="off")
