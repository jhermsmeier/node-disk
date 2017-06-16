# Examples

## Inspect

Inspect an imagefile's disk output:

```
$ node example/inspect <imagefile>
```

## Create

Create a raw image file of a given size with either an empty MBR, GPT or
hybrid MBR/GPT:

```
$ node example/create <size> <mbr[:type]|gpt|hybrid> <outputfile>
```
