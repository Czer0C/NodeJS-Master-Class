const environments = {};

environments.staging = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "staging",
  hashingSecret: "royalAss",
};

environments.production = {
  httpPort: 7000,
  httpsPort: 7001,
  envName: "production",
  hashingSecret: "royalPussy",
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
