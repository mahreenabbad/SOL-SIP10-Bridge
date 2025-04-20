(use-trait ft-trait .trait-sip-010-ft-standard.sip-010-trait)


(define-constant ERR-TRANSFER (err u201))
(define-constant INSUFFICIENT-BALANCE (err u203))

;; Counter to generate unique lock-ids
(define-data-var lock-id-counter uint u0)

(define-map locks 
  {sender: principal, token: principal}  
  uint                                   
)

(define-map total-locks
  { lock-id: uint }  ;; Unique identifier for each lock event
  { sender: principal, token: principal, amount: uint }  ;; Data for the bridge
)

(define-map unlocks
  principal  
  {token: principal, amount: uint}  
)


(define-read-only (get-lock-id-counter)
    (var-get lock-id-counter)
)


(define-read-only (get-lock-event (lock-id uint))
  (map-get? total-locks { lock-id: lock-id })
)



(define-public (lock (amount uint) (token <ft-trait>))
  (begin
    (asserts! (> amount u0) INSUFFICIENT-BALANCE)
    (asserts! (is-ok (contract-call? token 
                                      transfer 
                                       amount 
                                        tx-sender 
                                         (as-contract tx-sender) 
                                           none)) ERR-TRANSFER)

    (let ((existing-amount (default-to u0 
                          (map-get? locks {sender: tx-sender, token: (contract-of token)}))))
      (map-set locks 
               {sender: tx-sender, token: (contract-of token)}
               (+ amount existing-amount))
      
      (let ((current-lock-id (var-get lock-id-counter)))
        (var-set lock-id-counter (+ current-lock-id u1))
        (map-set total-locks
                 { lock-id: current-lock-id }
                 { sender: tx-sender, token: (contract-of token), amount: amount})
        
        (let ((event
                { op: "SIP-10 Locked",
                  sender: tx-sender,
                  token: (contract-of token),
                  amount-locked: amount,
                  total-locked: (+ amount existing-amount),
                  lock-id: current-lock-id }))
          (print event)
          (ok event))))
  )
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
