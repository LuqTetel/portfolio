# Portfolio (Docker)

This is a static portfolio site that lists your certificates and provides your resume + CV as downloadable PDFs.

## Run locally (no Docker)

- Open `public/index.html` in a browser, or run a simple server:
  - `python -m http.server 8000 --directory public`
  - Then visit `http://localhost:8000`

## Deploy with Docker

- Build:
  - `docker build -t my-portfolio .`
- Run:
  - `docker run --rm -p 8080:80 my-portfolio`
- Open:
  - `http://localhost:8080`

Or with compose:

- `docker compose up --build`

## Update your info

- Profile details: `public/data/profile.json`
- Resume PDF: `public/docs/resume.pdf`
- CV PDF: `public/docs/cv.pdf`
- Certificates PDF folder: `public/Certificate/`
- Certificate list shown on the site: `public/data/certificates.json`

