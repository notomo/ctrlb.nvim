
if exists('g:loaded_ctrlb')
    finish
endif
let g:loaded_ctrlb = 1

command! -nargs=* Ctrlb call ctrlb#execute(<q-args>)
command! -nargs=* CtrlbOpen call ctrlb#open(<q-args>)
command! -nargs=0 CtrlbClearAll call ctrlb#clear_all()
