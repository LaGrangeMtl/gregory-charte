<nav class="menu-head-sticky">
	<div class="container">
		<div class="col-md-3">
			<a href="#" class="logo">Company logo</a>
		</div>
		<div class="col-md-9 navigation-row">
			<ul class="navigation">
				<li class="menu-item">
					<a href="#">Menu-item</a>
				</li>
				<li class="menu-item-parent">
					<a href="#">Parent Menu-item <i class="fa fa-angle-right visible-xs-inline-block visible-sm-inline-block"></i></a>
					<ul>
						<div class="visible-xs visible-sm back-btn">
							<i class="fa fa-angle-left"></i> Back
						</div>
						<li class="menu-item-child">
							<a href="#">Hello Children</a>
						</li>
						<li class="menu-item-child">
							<a href="#">Hello Children</a>
						</li>
						<li class="menu-item-child">
							<a href="#">Hello Children</a>
						</li>
						<li class="menu-item-child">
							<a href="#">Hello Children</a>
						</li>
					</ul>
				</li>
				<li class="menu-item">
					<a href="#">Menu-item</a>
				</li>
				<li class="menu-item">
					<a href="#">Longer menu-item</a>
				</li>
			</ul>
			<div class="menu-tab" data-menu-tab="1">
				<i class="fa fa-unlock"></i>
				<div class="tab-content">
					<div class="close-btn visible-xs visible-sm">
						<i class="fa fa-angle-left"></i> Back
					</div>
					<h1>Login</h1>

					<form action="" class="clear-form">
						<fieldset>
							<div class="field">
								<input type="email" name="login-email" id="login-email" />
								<label for="login-email">Email</label>
							</div>

							<div class="field">
								<input type="password" name="login-password" id="login-password" />
								<label for="login-password">Password</label>
							</div>
						</fieldset>

						<fieldset>
							<div class="half">
								<input id="login-remember" name="login-remember" type="checkbox"/>
								<label for="login-remember"><span class="cbox"></span>Remember me</label>
							</div>
							<div class="half align-right">
								<a href="#" class="lost-password">Lost password ?</a>
							</div>
						</fieldset>

						<fieldset class="row-buttons">
							<input type="submit" value="Log in" class="btn-fw-fill" />
						</fieldset>
					</form>
				</div>
			</div>
			<div class="menu-tab-dark" data-menu-tab="2">
				<i class="fa fa-search"></i>
				<div class="tab-content">
					<div class="close-btn visible-xs visible-sm">
						<i class="fa fa-angle-left"></i> Back
					</div>
					<h1>Search</h1>

					<form action="" class="clear-form">
						<fieldset>
							<div class="field">
								<input type="text" name="search" id="search" />
								<label for="search">Your search</label>
							</div>
						</fieldset>

						<fieldset class="row-buttons">
							<input type="submit" value="Search" class="btn-fw-fill" />
						</fieldset>
					</form>
				</div>
			</div>
		</div>
	</div>
</nav>
