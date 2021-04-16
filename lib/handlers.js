import { _data } from "./data.js";
import { helpers } from "./helpers.js";

export const handlers = {};

handlers.users = (data, callback) => {
  const validMethods = ["get", "post", "put", "delete"];

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
    const readPhone = _data.read("users", _phone);

    if (readPhone === "ENOENT") {
      callback(400, { error: "Phone number does not exist ❗" });
    } else {
      delete readPhone._password;
      callback(200, { payload: readPhone });
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
    const deleteUser = _data.delete("users", _phone);

    if (deleteUser === true) {
      callback(200, { message: `Successfully deleted ${_phone}` });
    } else {
      callback(400, { error: "Phone number does not exist ❗" });
    }
  } else {
    callback(400, { error: "Missing phone number ❗" });
  }
};

handlers.ping = (data, callback) => {
  callback(200, { message: "pong 🏓 ping" });
};

handlers.notFound = (data, callback) => {
  callback(404, { error: "404 Not Found ❗" });
};
