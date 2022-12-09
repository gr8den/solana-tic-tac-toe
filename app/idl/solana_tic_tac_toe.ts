export type SolanaTicTacToe = {
  "version": "0.1.0",
  "name": "solana_tic_tac_toe",
  "instructions": [
    {
      "name": "play",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "tile",
          "type": {
            "defined": "Tile"
          }
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "statsProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playerTwo",
          "type": "publicKey"
        },
        {
          "name": "adminBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "turn",
            "type": "u8"
          },
          {
            "name": "players",
            "type": {
              "array": [
                "publicKey",
                2
              ]
            }
          },
          {
            "name": "board",
            "type": {
              "array": [
                {
                  "array": [
                    {
                      "option": {
                        "defined": "Sign"
                      }
                    },
                    3
                  ]
                },
                3
              ]
            }
          },
          {
            "name": "status",
            "type": {
              "defined": "GameStatus"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Tile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": "u8"
          },
          {
            "name": "y",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "GameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Tie"
          },
          {
            "name": "Won",
            "fields": [
              {
                "name": "winner",
                "type": "publicKey"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "Sign",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "X"
          },
          {
            "name": "O"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "StateUpdated",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "turn",
          "type": "u8",
          "index": false
        },
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "option": {
                      "defined": "Sign"
                    }
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "GameStatus"
          },
          "index": false
        }
      ]
    },
    {
      "name": "NewGame",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "playerTwo",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyInited"
    },
    {
      "code": 6001,
      "name": "NotPlayer"
    },
    {
      "code": 6002,
      "name": "NotPlayersTurn"
    },
    {
      "code": 6003,
      "name": "InvalidTile"
    },
    {
      "code": 6004,
      "name": "TileNotEmpty"
    },
    {
      "code": 6005,
      "name": "WrongIdx"
    },
    {
      "code": 6006,
      "name": "GameNotActive"
    }
  ]
};

export const IDL: SolanaTicTacToe = {
  "version": "0.1.0",
  "name": "solana_tic_tac_toe",
  "instructions": [
    {
      "name": "play",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "tile",
          "type": {
            "defined": "Tile"
          }
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "statsProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playerTwo",
          "type": "publicKey"
        },
        {
          "name": "adminBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "turn",
            "type": "u8"
          },
          {
            "name": "players",
            "type": {
              "array": [
                "publicKey",
                2
              ]
            }
          },
          {
            "name": "board",
            "type": {
              "array": [
                {
                  "array": [
                    {
                      "option": {
                        "defined": "Sign"
                      }
                    },
                    3
                  ]
                },
                3
              ]
            }
          },
          {
            "name": "status",
            "type": {
              "defined": "GameStatus"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Tile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x",
            "type": "u8"
          },
          {
            "name": "y",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "GameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Tie"
          },
          {
            "name": "Won",
            "fields": [
              {
                "name": "winner",
                "type": "publicKey"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "Sign",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "X"
          },
          {
            "name": "O"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "StateUpdated",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "turn",
          "type": "u8",
          "index": false
        },
        {
          "name": "board",
          "type": {
            "array": [
              {
                "array": [
                  {
                    "option": {
                      "defined": "Sign"
                    }
                  },
                  3
                ]
              },
              3
            ]
          },
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "GameStatus"
          },
          "index": false
        }
      ]
    },
    {
      "name": "NewGame",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "playerTwo",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyInited"
    },
    {
      "code": 6001,
      "name": "NotPlayer"
    },
    {
      "code": 6002,
      "name": "NotPlayersTurn"
    },
    {
      "code": 6003,
      "name": "InvalidTile"
    },
    {
      "code": 6004,
      "name": "TileNotEmpty"
    },
    {
      "code": 6005,
      "name": "WrongIdx"
    },
    {
      "code": 6006,
      "name": "GameNotActive"
    }
  ]
};
