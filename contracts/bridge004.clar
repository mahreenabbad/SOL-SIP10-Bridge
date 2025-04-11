(use-trait ft-trait .trait-sip-010-ft-standard.sip-010-trait)


(define-constant ERR-TRANSFER (err u201))
(define-constant  ERR_MISMATCHED_TOKENS (err u202))
(define-constant INSUFFICIENT-BALANCE (err u203))


(define-map locks 
  {sender: principal, token: principal}  
  uint                                   
)

(define-map unlocks
  principal  
  {token: principal, amount: uint}  
)


(define-public (lock (amount uint) (token <ft-trait>))
  (begin
  
    (asserts! (> amount u0)  INSUFFICIENT-BALANCE)
    (asserts! (is-ok (contract-call? token
                               transfer 
                                 amount 
                                   tx-sender 
                                     (as-contract tx-sender) 
                                         none)) ERR-TRANSFER)


    ;; Update the mapping 
    (let ((existing-amount (default-to u0 
                          (map-get? locks {sender: tx-sender, token: (contract-of token)}))))
      (map-set locks 
               {sender: tx-sender, token: (contract-of token)}
               (+ amount existing-amount))
    (let ((event
                    {op  : "SIP-10 Locked",
                    sender : tx-sender,
                    token: (contract-of token),
                    amount-locked : amount,
                    total-locked: (+ amount  existing-amount) 
                     }))
         (print event)
         (ok event))
  ))
)




(define-public (unlock (amount uint) (recipient principal) (token <ft-trait>))
(begin

  (asserts! (as-contract (is-ok (contract-call? token transfer amount (as-contract tx-sender) recipient none)))
    ERR-TRANSFER)  
    
      (map-set unlocks
              recipient
              {token: (contract-of token), amount: amount})
        
      ;; Emit event
      (ok {op: "Unlocked",
           recipient: recipient,
           token: (contract-of token),
           amount: amount,
           })
    )
  )
  ;; STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV.bridge004