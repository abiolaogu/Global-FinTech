FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
ENV OPA_URL=http://opa:8181/v1/data/payouts/decision
CMD ["uvicorn", "regai_service.app:app", "--host", "0.0.0.0", "--port", "8000"]
