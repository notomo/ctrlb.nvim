
if exists('g:loaded_ctrlb')
    finish
endif
let g:loaded_ctrlb = 1

command! -nargs=* -complete=custom,ctrlb#_complete Ctrlb call ctrlb#execute(<q-args>)
command! -nargs=1 -complete=custom,ctrlb#_complete CtrlbOpen call ctrlb#open(<q-args>)
command! -nargs=1 -complete=file CtrlbOpenLayout call ctrlb#open_layout(<q-args>)
command! -nargs=0 CtrlbClearAll call ctrlb#clear_all()
