const environments = {};

environments.staging = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "staging",
  hashingSecret: "Gaftonosh",
  maxChecks: 5,
};

environments.production = {
  httpPort: 7000,
  httpsPort: 7001,
  envName: "production",
  hashingSecret: "Gaftonosh",
  maxChecks: 5,
};

const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : "";

export const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

// module.exports.environmentToExport = environmentToExport;
