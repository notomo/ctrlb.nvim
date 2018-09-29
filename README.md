# ctrlb.nvim

ctrlb.nvim is a [ctrlb](https://github.com/notomo/ctrlb) client plugin for Neovim.  
This plugin can control web browsers without moving the focus from Neovim.

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

## Usage

```
:Ctrlb tab:reload
:Ctrlb tab:open -url=https://github.com/notomo/ctrlb.nvim
```
