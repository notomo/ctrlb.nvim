
if exists('g:loaded_ctrlb')
    finish
endif
let g:loaded_ctrlb = 1

command! -nargs=* Ctrlb call ctrlb#execute(<q-args>)
