const loginBtn = document.getElementById('login-btn')

loginBtn.addEventListener('click', async (e)=>{
    e.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const result = await fetch('http://localhost:3000/login',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body : JSON.stringify({
            username,
            password
        })
    })
    if(result.ok){
        window.location.replace('home.html')
    }else{
        document.getElementById('usernameExists').style.display='flex'
        document.getElementById('username').valu=''
        document.getElementById('password').value=''
    }
})