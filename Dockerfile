FROM python:3.9

WORKDIR /app

RUN pip install pipenv
COPY Pipfile* .
RUN pipenv lock --keep-outdated --requirements > requirements.txt

RUN pip install -r requirements.txt

COPY . .

EXPOSE 3000

CMD ["uwsgi", "uwsgi.ini"]