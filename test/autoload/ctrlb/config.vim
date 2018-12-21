
let s:suite = themis#suite('config')
let s:assert = themis#helper('assert')

function! s:suite.before()
    let s:root = CtrlbTestBefore()
endfunction

function! s:suite.after_each()
    call CtrlbTestAfterEach()
endfunction

function! s:suite.config_set_and_get()
    let timeout = 1
    call ctrlb#config#set('timeout', timeout)

    call s:assert.equals(ctrlb#config#get('timeout'), timeout)
endfunction
