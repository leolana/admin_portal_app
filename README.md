# Portal 3.0 (Portavity - Portal Financeiro + Gravity)

Portal do Cliente  **Portal Financeiro** developed in **[Angular][angular]** 🎉


---

## Tech Stack

* [Angular][angular],[typescript][typescript],[ts-node][tsnode],[ts-lint][tslint]    — core platform and dev tools
* [Karma][karma], [protractor][protractor], [jasmine][jasmine]  - Test

## Directory Layout

```bash
.
├── /src/
│   ├── /app/                       # app module
│   ├── /assets/                    # Assets file
│   ├── /environment/               # Environment configuration
│   ├── favicon.ico                 # Application icon
│   ├── index.html
│   ├── main.js                     # Style file
│   ├── polyfills.ts                # polyfills for browser support
│   ├── style.css                   # Style file
│   ├── tsconfig.app.json           # specify compiler options
│   ├── tsconfig.spec.json          # specify compiler options
│   ├── tslint.json                 # Lint configuration
├── angular.json                    # Angular configuration
├── package-lock.json               # List of project dependencies
├── package.json                    # List of project dependencies
├── README.md                       # This file
├── tsconfig.json                   # specify compiler options
├── tslint.json                     # Lint configuration
```


## Prerequisites

* [Node.Js][node] 
* [npm][npm] 
* [VS Code][code] editor, [ESLint][eslint] plug-ins.


## Getting Started

* Clone and run  `npm i`

```bash
git clone https://github.com/ITLAB-BR/alpe-bko alpe-bko
cd alpe-bko                  # Change to the project directory
npm i                        # install all dependencies
npm start                    # run the project
```

## Available Commands

* Start Application `npm start`
* Build Application `npm build`
* Lint Application `npm lint`
* Build Prod Application `build-prod`
* Build Dev Application `build-dev`

---

## Components

Component Docs in `docs/components`:
* [Toastr](./docs/components/toastr.md)
* [Date-picker](./docs/components/date-picker/date-picker.md)
* [Datatable](./docs/components/datatable.md)
* [AlpeTabs](./docs/components/alpe-tabs/alpe-tabs.md)
* [Modal-cancelamento](./docs/components/modal-cancelamento.md)


## Related Projects

* [API](https://bitbucket.org/timefinanceiro/alpe-credenciamento-back/) —   API repository
* [Integration](https://bitbucket.org/timefinanceiro/alpe-integracao-erp/src/develop/) — Integration gateway

---

## Contributors

Please read [CONTRIBUTORS.md](./docs/CONTRIBUTORS.md) for details on our code of conduct, and the process for submitting pull requests to us.

---

## Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

---

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

---
Made with ♥ by ITLAB (http://www.itlab.com.br)

[winston]: https://github.com/winstonjs/winston
[jasmine]: https://jasmine.github.io
[js]: https://developer.mozilla.org/docs/Web/JavaScript
[Karma]: https://karma-runner.github.io/latest/index.html
[postgres]: https://www.postgresql.org/
[restify]: http://restify.com/
[protractor]: https://www.protractortest.org
[code]: https://code.visualstudio.com/
[Angular]:https://angular.io
[typescript]: https://www.typescriptlang.org
[npm]:https://www.npmjs.com
[tsnode]: https://github.com/TypeStrong/ts-node
[eslint]: https://eslint.org/
[node]: https://nodejs.org/en/
[tslint]:https://palantir.github.io/tslint/
[session]:https://github.com/expressjs/session