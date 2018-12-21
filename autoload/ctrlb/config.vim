
let s:default_config = {
    \ 'timeout': 2,
    \ 'port': v:null,
\ }
let s:config = s:default_config

function! ctrlb#config#set(key, value) abort
    if !has_key(s:config, a:key)
        throw a:key . ' does not exist in config options.'
    endif
    let s:config[a:key] = a:value
endfunction

function! ctrlb#config#get(key) abort
    if !has_key(s:config, a:key)
        throw a:key . ' does not exist in config options.'
    endif
    return s:config[a:key]
endfunction

function! ctrlb#config#clear() abort
    let s:config = s:default_config
endfunction
