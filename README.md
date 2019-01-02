# ctrlb.nvim

[![Build Status](https://travis-ci.org/notomo/ctrlb.nvim.svg?branch=master)](https://travis-ci.org/notomo/ctrlb.nvim)
[![Build status](https://ci.appveyor.com/api/projects/status/hgtnmfc1uvoj65yf/branch/master?svg=true)](https://ci.appveyor.com/project/notomo/ctrlb-nvim/branch/master)
[![codecov](https://codecov.io/gh/notomo/ctrlb.nvim/branch/master/graph/badge.svg)](https://codecov.io/gh/notomo/ctrlb.nvim)

ctrlb.nvim is a [ctrlb](https://github.com/notomo/ctrlb) client plugin for Neovim.  
This plugin can control web browsers without moving the focus from Neovim.

## Demo
<img src="https://raw.github.com/wiki/notomo/ctrlb.nvim/images/demo.gif" width="1280">

## Requirements
- Neovim
    - Node.js provider
- [ctrlb](https://github.com/notomo/ctrlb)
- [wsxhub](https://github.com/notomo/wsxhub)

## Install

```sh
# install Node.js provider
npm install -g neovim
```

### [dein.vim](https://github.com/Shougo/dein.vim)

```vim
call dein#add('notomo/ctrlb.nvim', {'build': 'npm run setup'})
```

or TOML configuration
```toml
[[plugins]]
repo = 'notomo/ctrlb.nvim'
build = 'npm run setup'
```

NOTE: If the npm version < 5.7, use `npm install & npm run build` instead of `npm run setup`.
`npm run setup` requires `npm ci`.  

NOTE: `:checkhealth ctrlb` checks whether the installation is valid.

## Usage

```
:Ctrlb tab/reload
:Ctrlb tab/open -url=https://github.com/notomo/ctrlb.nvim
```
