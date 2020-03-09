# livecoding-ai-drums
Generate livecoding drum patterns with [magenta.js](https://magenta.tensorflow.org/)

This project is an API for using the magenta machine learning tool to generate FoxDot drum patterns. After providing a seed pattern, the neural network will dream up a continuation to your pattern. The API output format is ready to go in FoxDot format, and can be executed automatically or copied, pasted, and edited.

Check out the project on the interwebs @ [Codercat](https://codercat.tk/neurojam.html)

## API
```
POST https://codercat.tk/livecoding/foxdot/ai-drums

Body:
{
    'pattern': 'x x .  rr',
    'length': '4',
    'randomness': '2'
}
```

## Parameters

**Pattern** : The seed pattern. A concatenation of foxdot patterns of the same length, separated by a period (.) . 

Example: 
```python
d1 >> play('x x ')
d2 >> play('  rr')
```
results in the seed pattern of `"x x .  rr"`

**Length** : The number of characters in the output segment 

**Randomness** : Used to control the randomness of predictions, where higher values increase randomness. Range(1-10)


## Usage

### FoxDot IDE, Atom Extension, or Python Shell

Copy and paste your parameters into the `params` dictionary, and execute. The following snippet will automatically execute the new FoxDot players. 

```python
import requests

params = {'pattern':'x x .  rr', 'length':'4','randomness':'2'}
response = requests.post('https://codercat.tk/livecoding/foxdot/ai-drums', data=params)
if response.status_code == 200:
    for line in response.text.splitlines():
        execute(line)
else :
    print(response.text)
```

If you would like to just print the players and execute them yourself, simply use the following snippet : 
```python
import requests
response = requests.post('https://codercat.tk/livecoding/foxdot/ai-drums', data={'length':'4','randomness':'2', 'pattern':'x x .  rr'})
print(response.text)
```

### Terminal
You know what to do. 

```curl -d '{"pattern":"x x .  rr", "length": "30", "randomness", "2"}' -H "Content-Type: application/json" -X POST https://codercat.tk/livecoding/foxdot/ai-drums```


## Refs

[Neural Drum Machine](https://codepen.io/teropa/details/JLjXGK)

[Magenta JS](https://magenta.tensorflow.org/)

[FoxDot](https://foxdot.org/)
