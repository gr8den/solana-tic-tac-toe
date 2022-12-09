export type Stats = {
  "version": "0.1.0",
  "name": "stats",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "stats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "admin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "incGamesCount",
      "accounts": [
        {
          "name": "stats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "statsData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "gamesCount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotInited"
    },
    {
      "code": 6001,
      "name": "AlreadyInited"
    },
    {
      "code": 6002,
      "name": "NotAuthorized"
    }
  ]
};

export const IDL: Stats = {
  "version": "0.1.0",
  "name": "stats",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "stats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "admin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "incGamesCount",
      "accounts": [
        {
          "name": "stats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "statsData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "gamesCount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotInited"
    },
    {
      "code": 6001,
      "name": "AlreadyInited"
    },
    {
      "code": 6002,
      "name": "NotAuthorized"
    }
  ]
};
