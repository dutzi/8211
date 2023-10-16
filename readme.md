# 8211

## Preparing Data

Create a file named `.env`, fill it with the app's password:

```
PASSWORD_USER=<app password>
```

Create a CSV file named `data.csv`, place it in `src/data/data.csv`, it should look something like this:

```csv
_,division,name,phone,title
_,מחלקה 1,ישראל ישראלי,054-1234567,"מ""מ"
```

Then run:

```sh
yarn encrypt-data
```

That will create a file named `data.ts`.

## Deploy

```sh
git push
```
