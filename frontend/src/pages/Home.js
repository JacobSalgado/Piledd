function Home() {
    return (
        <div className="page home">
            <h1>Welcome to Piledd</h1>
            <p>Book tracking logger and review website</p>
            <div className="home-actions">
                <Link to="/register" className="btn">Create an Account</Link>
                <Link to="/login" className="btn btn-secyondary">Log In</Link>
            </div>
        </div>
    )
}

export default Home;