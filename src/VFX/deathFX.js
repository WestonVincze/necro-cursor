export const explode = ({ x, y, color }) => ({
  "lifetime": {
    "min": 0.5,
    "max": 0.5
  },
  "frequency": 0.008,
  "emitterLifetime": 0.31,
  "maxParticles": 1000,
  "addAtBack": false,
  "pos": {
    "x": x,
    "y": y
  },
  "behaviors": [
    {
      "type": "alpha",
      "config": {
        "alpha": {
          "list": [
            {
              "time": 0,
              "value": 0.4
            },
            {
              "time": 1,
              "value": 0.1
            }
          ]
        }
      }
    },
    {
      "type": "moveSpeed",
      "config": {
        "speed": {
          "list": [
            {
              "time": 0,
              "value": 80
            },
            {
              "time": 1,
              "value": 20
            }
          ]
        }
      }
    },
    {
      "type": "scale",
      "config": {
        "scale": {
          "list": [
            {
              "time": 0,
              "value": 0.6 
            },
            {
              "time": 1,
              "value": 0.2
            }
          ]
        },
        "minMult": 1
      }
    },
    {
      "type": "color",
      "config": {
        "color": {
          "list": [
            {
              "time": 0,
              "value": "#fb5555"
            },
            {
              "time": 0.4,
              "value": "#aa2121"
            },
            {
              "time": 1,
              "value": "#aa2121"
            }
          ]
        }
      }
    },
    {
      "type": "rotationStatic",
      "config": {
        "min": 0,
        "max": 360
      }
    },
    {
      "type": "textureRandom",
      "config": {
        "textures": [
          "assets/particle.png"
        ]
      }
    },
    {
      "type": "spawnShape",
      "config": {
        "type": "torus",
        "data": {
          "x": 0,
          "y": 0,
          "radius": 10,
          "innerRadius": 0,
          "affectRotation": false
        }
      }
    }
  ]
});