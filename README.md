## Setup

### Install

- install libraries. Once the project is cloned,
execute the following commands from the root directory of the project:

```
npm install
```

### Other Requirements

- Install `Grenache Grape`: https://github.com/bitfinexcom/grenache-grape:

```
npm i -g grenache-grape
```

- Run two Grapes:

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

### Run service

```
npm start
```

> After starting the service, setup the client: https://github.com/ZIMkaRU/test-bit-client
