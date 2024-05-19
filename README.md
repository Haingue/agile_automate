# TMMF - Agile automate

[![Analyze code](https://github.com/Haingue/agile_automate/actions/workflows/analyze.yml/badge.svg)](https://github.com/Haingue/agile_automate/actions/workflows/analyze.yml)
[![.github/workflows/release-gcp.yml](https://github.com/Haingue/agile_automate/actions/workflows/release-gcp.yml/badge.svg)](https://github.com/Haingue/agile_automate/actions/workflows/release-gcp.yml)

## Description

Robot helping to use Jira/Confluence from TMMF's project management method.

### Tools

- [Nest](https://github.com/nestjs/nest)
- Jest
- Docker

## License

This project is released under the [MIT license](LICENSE).

## Usage

Configure your Confluence Automate to call the first endpoint and Configure your Jira automate to call the second endpoint.

| N°  | URL                     | Description                                                                                                                                                                                                                                                                                                                                                                                                     | Body            |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 1   | `/tmmf/approve-project` | Url to approved a project canvas, the automate will send an email to the team and create the project initiative in Jira                                                                                                                                                                                                                                                                                         | [Page content]  |
| 2   | `/tmmf/start-project`   | Url to start a project, the automate will send a email and create the Preparation Epic and every static tasks and create every conflucence page related to each issue. <div>test</div> <br/> Exemple: <br/> > Initiative <br/> ---> Epic Preparation <br/> ------> Task Stakeholders <br/> ------> [...] <br/> ------> Task Architecture <br/> ------> Task Ringi <br/> ------> Task DoR/DoD <br/> ---> Epic Do | [Issue content] |

```mermaid
sequenceDiagram
  actor DL as DigitalLeader
  actor PM as ProjectManager
  participant C as Confluence
  participant J as Jira
  participant AA as Agile Automate

  DL -) C: Submit a project Canvas
  C -->> PM: Send email
  loop Canvas Validation
    PM -> DL: Canvas adjustment
  end

  PM -) C: Approve project canvas
  C -->> +AA: Send the canvas content
  par
  AA -->> J: Create Project inititative
  and
  AA -->> PM: Send email
  AA -->> -DL: Send email
  end

  note over DL, AA: [few weeks later]

  PM -) J: Move Project initiative in "Backlog"
  J -->> +AA: Send Project initiative content
  par
  AA -->> J: Create Epic Preparation
  AA -->> J: Create Preparation tasks
  AA -->> J: Create Epic Do
  and
  AA -->> C: Create (if not exist) the Theme page
  AA -->> C: Create the Initiative page
  AA -->> C: Create the Documentation page
  AA -->> C: Create the Epic page
  and
  AA -->> PM: Send email
  AA -->> -DL: Send email
  end
```

## Container

```bash
docker build --tag agile_automate .
docker run -p 3000:3000 --detach agile_automate
```

## Source code

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Troubleshooting

Read about troubleshooting.

## Contributing

This project welcomes contributions.
