import { _data } from "./data.js";
import { helpers } from "./helpers.js";
import { environmentToExport as config } from "./config.js";

export const handlers = {};

const validMethods = ["get", "post", "put", "delete"];
const validProtocols = ["https", "http"];

handlers.users = (data, callback) => {
  if (validMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

handlers._users.get = (data, callback) => {
  const { phone } = data.queryStringObject;

  const _phone =
    typeof phone === "string" && phone.trim().length === 10 ? phone : false;

  if (_phone) {
    const { token } = data.headers;

    const _token = typeof token === "string" ? token : false;

    const verifiedToken = handlers._tokens.verify(_token, _phone);

    if (verifiedToken) {
      const readPhone = _data.read("users", _phone);

      if (readPhone === "ENOENT") {
        callback(400, { error: "Phone number does not exist ❗" });
      } else {
        delete readPhone._password;
        callback(200, { payload: readPhone });
      }
    } else {
      callback(403, {
        error: "Missing required token in header or token is invalid ❗",
      });
    }
  } else {
    callback(400, { error: "Missing phone number ❗" });
  }
};

handlers._users.post = (data, callback) => {
  const { firstName, lastName, phone, password, tosAgreement } = data.payload;

  const _firstName =
    typeof firstName === "string" && firstName.trim().length > 0
      ? firstName
      : false;

  const _lastName =
    typeof lastName === "string" && lastName.trim().length > 0
      ? lastName
      : false;

  const _phone =
    typeof phone === "string" && phone.trim().length === 10 ? phone : false;

  const _password =
    typeof password === "string" && password.trim().length > 0
      ? password
      : false;

  const _tosAgreement =
    typeof tosAgreement === "boolean" && tosAgreement === true
      ? tosAgreement
      : false;

  if (_firstName && _lastName && _phone && _password && _tosAgreement) {
    try {
      const readPhone = _data.read("users", phone);

      if (readPhone === "ENOENT") {
        const hashedPassword = helpers.hash(_password);

        if (hashedPassword) {
          const userPayload = {
            _firstName,
            _lastName,
            _phone,
            _password: hashedPassword,
            _tosAgreement,
          };

          _data.create("users", phone, userPayload);

          callback(200, { payload: userPayload });
        } else {
          callback(500, { error: "Could not hash password ❗" });
        }
      } else {
        callback(400, { error: "User already exists ❗" });
      }
    } catch (error) {
      callback(400, { error: error.message });
    }
  } else {
    callback(400, { error: "Missing required fields ❗" });
  }
};

handlers._users.put = (data, callback) => {
  const { firstName, lastName, phone, password } = data.payload;

  const _firstName =
    typeof firstName === "string" && firstName.trim().length > 0
      ? firstName
      : false;

  const _lastName =
    typeof lastName === "string" && lastName.trim().length > 0
      ? lastName
      : false;

  const _phone =
    typeof phone === "string" && phone.trim().length === 10 ? phone : false;

  const _password =
    typeof password === "string" && password.trim().length > 0
      ? password
      : false;

  if (_phone) {
    if (_firstName || _lastName || _password) {
      const { token } = data.headers;

      const _token = typeof token === "string" ? token : false;

      const verifiedToken = handlers._tokens.verify(_token, _phone);

      if (verifiedToken) {
        const readPhone = _data.read("users", _phone);

        if (readPhone !== "ENOENT") {
          if (_firstName) {
            readPhone._firstName = _firstName;
          }

          if (_lastName) {
            readPhone._lastName = _lastName;
          }

          if (_password) {
            readPhone._password = helpers.hash(_password);
          }

          const updateUser = _data.update("users", _phone, readPhone);

          if (updateUser) {
            delete readPhone._password;
            callback(200, { payload: readPhone });
          } else {
            callback(500, { error: "Could not update user ❗" });
          }
        } else {
          callback(400, { error: "Phone number does not exist ❗" });
        }
      } else {
        callback(403, {
          error: "Missing required token in header or token is invalid ❗",
        });
      }
    } else {
      callback(400, { error: "Missing fields to update ❗" });
    }
  } else {
    callback(400, { error: "Invalid phone number ❗" });
  }
};

handlers._users.delete = (data, callback) => {
  const { phone } = data.queryStringObject;

  const _phone =
    typeof phone === "string" && phone.trim().length === 10 ? phone : false;

  if (_phone) {
    const { token } = data.headers;

    const _token = typeof token === "string" ? token : false;

    const verifiedToken = handlers._tokens.verify(_token, _phone);

    if (verifiedToken) {
      const readUser = _data.read("users", _phone);
      if (readUser !== "ENOENT") {
        const userChecks =
          typeof readUser.checks === "object" &&
          readUser.checks instanceof Array
            ? readUser.checks
            : [];

        const checksToDelete = userChecks.length;

        if (checksToDelete > 0) {
          let deletionErrors = false;

          userChecks.forEach((check) => {
            const deletedCheck = _data.delete("checks", check);

            deletionErrors = !deletedCheck;
          });

          if (!deletionErrors) {
            const deleteUser = _data.delete("users", _phone);

            if (deleteUser === true) {
              callback(200, { message: `Successfully deleted ${_phone}` });
            } else {
              callback(400, { error: "Phone number does not exist ❗" });
            }
          } else {
            callback(500, {
              message: `Error encountered while wiping out checks records associated with ${_phone}`,
            });
          }
        }
      } else {
        callback(404, { message: "User does not exist" });
      }
    } else {
      callback(403, {
        error: "Missing required token in header or token is invalid ❗",
      });
    }
  } else {
    callback(400, { error: "Missing phone number ❗" });
  }
};

handlers.tokens = (data, callback) => {
  if (validMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

handlers._tokens.get = (data, callback) => {
  const { id } = data.queryStringObject;
  const _id = typeof id === "string" && id.trim().length > 0 ? id : false;

  if (_id) {
    const readToken = _data.read("tokens", _id);

    if (readToken === "ENOENT") {
      callback(404, { error: "Token Id does not exist ❗" });
    } else {
      callback(200, { payload: readToken });
    }
  } else {
    callback(400, { error: "Missing token ID ❗" });
  }
};

handlers._tokens.post = (data, callback) => {
  const { phone, password } = data.payload;
  const _phone =
    typeof phone === "string" && phone.trim().length === 10 ? phone : false;

  const _password =
    typeof password === "string" && password.trim().length > 0
      ? password
      : false;

  if (_phone && _password) {
    const readUser = _data.read("users", _phone);

    if (readUser !== "ENOENT") {
      const hashedPassword = helpers.hash(_password);

      if (hashedPassword === readUser._password) {
        const tokenId = helpers.createRandomString(20);

        const expires = Date.now() + 1000 * 60 * 60;

        const tokenObject = {
          phone: _phone,
          id: tokenId,
          expires: expires,
        };

        try {
          const createToken = _data.create("tokens", tokenId, tokenObject);
          callback(200, tokenObject);
        } catch (error) {
          callback(500, { error: "Could not create token ❗" });
        }
      } else {
        callback(400, { error: "Password does not match user phone ❗" });
      }
    } else {
      callback(400, { error: "Phone number does not exist ❗" });
    }
  } else {
    callback(400, { error: "Missing required fields ❗" });
  }
};

handlers._tokens.put = (data, callback) => {
  const { id, extend } = data.payload;

  const _id = typeof id === "string" && id.trim().length > 0 ? id : false;
  const _extend =
    typeof extend === "boolean" && extend === true ? extend : false;

  if (_id && _extend) {
    const readToken = _data.read("tokens", _id);

    if (readToken !== "ENOENT") {
      if (readToken.expires > Date.now()) {
        readToken.expires = Date.now() + 1000 * 60 * 60;

        const updateToken = _data.update("tokens", _id, readToken);

        if (updateToken) {
          callback(200, { message: "Succesfully extended token." });
        } else {
          callback(500, { error: "Could not extend this token ❗" });
        }
      } else {
        callback(400, { error: "Token has already expired ❗" });
      }
    } else {
      callback(400, { error: "Token does not exist ❗" });
    }
  } else {
    callback(400, { error: "Missing or invalid required fields ❗" });
  }
};

handlers._tokens.delete = (data, callback) => {
  const { id } = data.queryStringObject;
  const _id = typeof id === "string" && id.trim().length > 0 ? id : false;

  if (_id) {
    const deleteUser = _data.delete("tokens", _id);

    if (deleteUser === true) {
      callback(200, { payload: `Successfully deleted token ${_id}` });
    } else {
      callback(404, { error: "Token Id does not exist ❗" });
    }
  } else {
    callback(400, { error: "Missing token ID ❗" });
  }
};

handlers._tokens.verify = (id, phone) => {
  const readToken = _data.read("tokens", id);

  const verifiedToken =
    readToken !== "ENOENT" &&
    readToken.phone === phone &&
    readToken.expires > Date.now();

  return verifiedToken;
};

handlers.checks = (data, callback) => {
  if (validMethods.includes(data.method)) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._checks = {};

handlers._checks.get = (data, callback) => {
  const { id } = data.queryStringObject;
  const _id = typeof id === "string" && id.trim().length > 0 ? id : false;

  if (_id) {
    const readChecks = _data.read("checks", _id);

    if (readChecks === "ENOENT") {
      callback(404, { error: "Check Id does not exist ❗" });
    } else {
      const { token } = data.headers;

      const _token = typeof token === "string" ? token : false;
      const verifiedToken = handlers._tokens.verify(
        _token,
        readChecks.userPhone
      );

      if (verifiedToken) {
        callback(200, readChecks);
      } else {
        callback(403, { message: "Invadlid permission ❗" });
      }
    }
  } else {
    callback(400, { error: "Missing check ID ❗" });
  }
};
handlers._checks.post = (data, callback) => {
  const { protocol, url, method, successCodes, timeoutSeconds } = data.payload;
  const _protocol =
    typeof protocol === "string" && validProtocols.includes(protocol)
      ? protocol
      : false;

  const _url = typeof url === "string" && url.trim().length > 0 ? url : false;

  const _method =
    typeof method === "string" && validMethods.includes(method)
      ? method
      : false;

  const _successCodes =
    typeof successCodes === "object" &&
    successCodes instanceof Array &&
    successCodes.length > 0
      ? successCodes
      : false;

  const _timeoutSeconds =
    typeof timeoutSeconds === "number" &&
    timeoutSeconds % 1 === 0 &&
    timeoutSeconds >= 1 &&
    timeoutSeconds <= 5
      ? method
      : false;

  if (_protocol && _url && _method && _successCodes && _timeoutSeconds) {
    const { token } = data.headers;

    const _token = typeof token === "string" ? token : false;

    const readToken = _data.read("tokens", _token);

    if (readToken !== "ENOENT") {
      const userPhone = readToken.phone;

      const readUser = _data.read("users", userPhone);

      if (readUser !== "ENOENT") {
        const userChecks =
          typeof readUser.checks === "object" &&
          readUser.checks instanceof Array
            ? readUser.checks
            : [];

        if (userChecks.length < config.maxChecks) {
          const checkId = helpers.createRandomString(20);

          const checkObject = {
            id: checkId,
            userPhone,
            _protocol,
            _url,
            _method,
            _successCodes,
            _timeoutSeconds,
          };

          const createChecks = _data.create("checks", checkId, checkObject);
          if (createChecks) {
            readUser.checks = userChecks;
            readUser.checks.push(checkId);
            console.log({ readUser });
            const updateUsers = _data.update("users", userPhone, readUser);

            console.log(readUser.checks);
            if (updateUsers) {
              callback(200, checkObject);
            } else {
              callback(500, {
                error: "Could not update the user with new check(s)",
              });
            }
          } else {
            callback(500, { error: "Could not create new check(s)" });
          }
        } else {
          callback(400, {
            error: `The user already has the maximum nember of check (${config.maxChecks})`,
          });
        }
      } else {
        callback(403);
      }
    } else {
      callback(403);
    }
  } else {
    callback(400, { error: "Missing or invalid required fields ❗" });
  }
};
handlers._checks.put = (data, callback) => {
  const { id } = data.payload;
  const _id = typeof id === "string" && id.trim().length > 0 ? id : false;

  if (_id) {
    const {
      protocol,
      url,
      method,
      successCodes,
      timeoutSeconds,
    } = data.payload;
    const _protocol =
      typeof protocol === "string" && validProtocols.includes(protocol)
        ? protocol
        : false;

    const _url = typeof url === "string" && url.trim().length > 0 ? url : false;

    const _method =
      typeof method === "string" && validMethods.includes(method)
        ? method
        : false;

    const _successCodes =
      typeof successCodes === "object" &&
      successCodes instanceof Array &&
      successCodes.length > 0
        ? successCodes
        : false;

    const _timeoutSeconds =
      typeof timeoutSeconds === "number" &&
      timeoutSeconds % 1 === 0 &&
      timeoutSeconds >= 1 &&
      timeoutSeconds <= 5
        ? method
        : false;

    if (_protocol || _url || _method || _successCodes || _timeoutSeconds) {
      const readChecks = _data.read("checks", _id);

      if (readChecks !== "ENOENT") {
        const { token } = data.headers;

        const _token = typeof token === "string" ? token : false;

        const verifiedToken = handlers._tokens.verify(
          _token,
          readChecks.userPhone
        );
        if (verifiedToken) {
          if (_protocol) {
            readChecks._protocol = _protocol;
          }

          if (_url) {
            readChecks._url = _url;
          }

          if (_method) {
            readChecks._method = _method;
          }

          if (_successCodes) {
            readChecks._successCodes = _successCodes;
          }

          if (_timeoutSeconds) {
            readChecks._timeoutSeconds = _timeoutSeconds;
          }

          const updateChecks = _data.update("checks", _id, readChecks);

          if (updateChecks) {
            callback(200, {
              message: "Successfully updated check " + _id,
              payload: readChecks,
            });
          } else {
            callback(500, { message: `Could not update check  + ${_id} ❗` });
          }
        } else {
          callback(403, { message: "No permission ❗" });
        }
      } else {
        callback(400, { error: "Check Id does not exist ❗" });
      }
    } else {
      callback(400, { error: "Missing field(s) to update ❗" });
    }
  } else {
    callback(400, { error: "Missing required field ❗" });
  }
};
handlers._checks.delete = (data, callback) => {
  const { id } = data.queryStringObject;

  const _id = typeof id === "string" && id.trim().length > 0 ? id : false;

  if (_id) {
    const readChecks = _data.read("checks", _id);

    if (readChecks !== "ENOENT") {
      const { token } = data.headers;

      const _token = typeof token === "string" ? token : false;

      const verifiedToken = handlers._tokens.verify(
        _token,
        readChecks.userPhone
      );

      if (verifiedToken) {
        const deleteChecks = _data.delete("checks", _id);

        if (deleteChecks === true) {
          const readUser = _data.read("users", readChecks.userPhone);

          if (readUser !== "ENOENT") {
            const userChecks =
              typeof readUser.checks === "object" &&
              readUser.checks instanceof Array
                ? readUser.checks
                : [];

            const checkPosition = userChecks.indexOf(_id);

            if (checkPosition > -1) {
              userChecks.splice(checkPosition, 1);

              const updateUser = _data.update(
                "users",
                readChecks.userPhone,
                readUser
              );

              if (updateUser) {
                delete readUser._password;
                callback(200, {
                  message: `succesffully deleted check ${_id}`,
                  payload: readUser,
                });
              } else {
                callback(500, { error: "Could not update user ❗" });
              }
            } else {
              callback(500, { message: "Could not find check in user ❗" });
            }
          } else {
            callback(404, { error: "Could not find user with this check ❗" });
          }
        } else {
          callback(400, { error: `Could not delete check ${_id} ❗` });
        }
      } else {
        callback(403, {
          error: "Missing required token in header or token is invalid ❗",
        });
      }
    } else {
      callback(404, { error: "Check ID does not exist ❗" });
    }
  } else {
    callback(400, { error: "Missing check ID ❗" });
  }
};

handlers.ping = (data, callback) => {
  callback(200, { message: "pong 🏓 ping" });
};

handlers.notFound = (data, callback) => {
  callback(404, { error: "404 Not Found ❗" });
};
