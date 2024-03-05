export const explosion = ({ x, y, color, speed }) => ({
  "lifetime": {
    "min": 0.5,
    "max": 1
  },
  "ease": [
    {
      "s": 0,
      "cp": 0.329,
      "e": 0.548
    },
    {
      "s": 0.548,
      "cp": 0.767,
      "e": 0.876
    },
    {
      "s": 0.876,
      "cp": 0.985,
      "e": 1
    }
  ],
  "frequency": 0.0001,
  "emitterLifetime": 0.01,
  "maxParticles": 100,
  "addAtBack": true,
  "pos": {
    "x": x,
    "y": y,
  },
  "behaviors": [
    {
      "type": "alpha",
      "config": {
        "alpha": {
          "list": [
            {
              "time": 0,
              "value": 0.34
            },
            {
              "time": 1,
              "value": 0
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
              "value": speed 
            },
            {
              "time": 1,
              "value": 0
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
              "value": 0.2
            },
            {
              "time": 1,
              "value": 1
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
              "value": color
            },
            {
              "time": 0.85,
              "value": "100f0c"
            },
            {
              "time": 1,
              "value": "100f0c"
            }
          ]
        }
      }
    },
    {
      "type": "rotation",
      "config": {
        "accel": 0,
        "minSpeed": 0,
        "maxSpeed": 200,
        "minStart": 0,
        "maxStart": 360
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
      "type": "spawnPoint",
      "config": {}
    },
    /*
    { // we could remove this... 
      "type": "spawnShape",
      "config": {
        "type": "torus",
        "data": {
          "x": 0,
          "y": 0,
          "radius": 40,
          "innerRadius": 39,
          "affectRotation": true
        }
      }
    }
    */
  ]
});