
let s:suite = themis#suite('ctrlb')
let s:assert = themis#helper('assert')

function! s:suite.before()
    let s:root = CtrlbTestBefore()
endfunction

function! s:suite.after_each()
    call CtrlbTestAfterEach()
endfunction

function! s:suite.open()
    call ctrlb#open('empty')

    call s:assert.equals(expand('%:p'), 'ctrlb://empty')
    call s:assert.equals(&filetype, 'ctrlb-empty')
endfunction

function! s:suite.open_layout()
    call ctrlb#open_layout('./test/autoload/layout.json')

    call s:assert.equals(expand('%:p'), 'ctrlb://empty')
    call s:assert.equals(&filetype, 'ctrlb-empty')
endfunction

function! s:suite.do_action()
    call ctrlb#do_action('empty', '_test')
endfunction

function! s:suite._complete()
    let result = ctrlb#_complete('', 'CtrlbOpen ', 10)

    call s:assert.is_string(result)
endfunction
