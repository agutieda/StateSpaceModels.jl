var documenterSearchIndex = {"docs":
[{"location":"examples/#Examples-1","page":"Examples","title":"Examples","text":"","category":"section"},{"location":"examples/#Air-Passengers-1","page":"Examples","title":"Air Passengers","text":"","category":"section"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Let's take the classical Air Passenger time series as an example. In order to avoid multiplicative effects, we use the well-known approach of taking the log of the series. The code is in the example folder.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"using CSV, StateSpaceModels, Plots, Statistics, Dates\n\n# Load the AirPassengers dataset\nAP = CSV.read(\"AirPassengers.csv\")\n\n# Take the log of the series\nlogAP = log.(Array{Float64}(AP[:Passengers]))\n\np1 = plot(AP[:Date], logAP, label = \"AirPassengers timeseries\", size = (1000, 500))","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"(Image: Log of Air Passengers time series)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"First we need to specify a state-space model. In this case, we'll utilize the basic structural model.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"# Create structural model with seasonality of 12 months\nmodel = structural(logAP, 12)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Estimating the model gives us the trend and seasonal components of the time series.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"# Estimate a StateSpace structure\nss = statespace(model)\n\n# Analyze its decomposition in trend and seasonal\np2 = plot(AP[:Date], [ss.smoother.alpha[:, 1] ss.smoother.alpha[:, 3]], layout = (2, 1),\n            label = [\"Trend component\" \"Seasonal component\"], legend = :topleft)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"(Image: Trend and seasonal components for log of Air Passengers)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"We can also forecast this time series. In this example, we will forecast 24 months ahead.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"# Forecast 24 months ahead\nN = 24\npred, dist = forecast(ss, N)\n\n# Define forecasting dates\nfirstdate = AP[:Date][end] + Month(1)\nnewdates = collect(firstdate:Month(1):firstdate + Month(N - 1))\n\np3 = plot!(p1, newdates, pred, label = \"Forecast\")","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"(Image: Forecast for log of Air Passengers)","category":"page"},{"location":"examples/#Vehicle-tracking-1","page":"Examples","title":"Vehicle tracking","text":"","category":"section"},{"location":"examples/#","page":"Examples","title":"Examples","text":"In order to illustrate one application that does not fall into any of the predefined models, thus requiring a user-defined model, let us consider an example from control theory. More precisely, we are going to use StateSpaceModels.jl to track a vehicle from noisy sensor data. In this case, y_t is a 2 times 1 observation vector representing the corrupted measurements of the vehicle's position on the two-dimensional plane in instant t. Since sensors collect the observations with the presence of additive Gaussian noise, we need to filter the observation in order to obtain a better estimate of the vehicle's position.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"The position and speed in each dimension compose the state of the vehicle. Let us refer to x_t^(d) as the position on the axis d and to dotx^(d)_t as the speed on the axis d in instant t. Additionally, let eta^(d)_t be the input drive force on the axis d, which acts as state noise. For a single dimension, we can describe the vehicle dynamics as","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"beginalign\n    x_t+1^(d) = x_t^(d) + Big( 1 - fracrho Delta_t2 Big) Delta_t dotx^(d)_t + fracDelta^2_t2 eta_t^(d) \n    dotx^(d)_t+1 = (1 - rho) dotx^(d)_t + Delta_t eta^(d)_t\nendalign","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"where Delta_t is the time step and rho is a known damping effect on speed. ","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"We can cast this dynamical system as a state-space model in the following manner:","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"beginalign \n    y_t = beginbmatrix 1  0  0  0  0  0  1  0 endbmatrix alpha_t+1 + varepsilon_t \n    alpha_t+1 = beginbmatrix 1  (1 - tfracrho Delta_t2) Delta_t  0  0  0  (1 - rho)  0  0  0  0  1  (1 - tfracrho Delta_t2)  0  0  0  (1 - rho) endbmatrix alpha_t + beginbmatrix tfracDelta^2_t2  0  Delta_t  0  0  tfracDelta^2_t2  0  Delta_t endbmatrix eta_t\nendalign","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"where alpha_t = (x_t^(1) dotx^(1)_t x_t^(2) dotx^(2)_t)^top and eta_t = (eta^(1)_t eta^(2)_t)^top.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"We can formulate the vehicle tracking problem in StateSpaceModels.jl as:","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"# State transition matrix\nT = kron(Matrix{Float64}(I, p, p), [1 (1 - ρ * Δ / 2) * Δ; 0 (1 - ρ * Δ)])\n# Input matrix\nR = kron(Matrix{Float64}(I, p, p), [.5 * Δ^2; Δ])\n# Output (measurement) matrix\nZ = kron(Matrix{Float64}(I, p, p), [1 0])\n# User defined model\nmodel = StateSpaceModel(y, Z, T, R)\n# Estimate vehicle speed and position\nss = statespace(model)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"In this example, we define the noise variances H and Q, generate the noises and simulate a random vehicle trajectory using the state-space equations:","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"# Generate random actuators\nQ = .5 * Matrix{Float64}(I, q, q)\nη = MvNormal(zeros(q), Q)\n# Generate random measurement noise\nH = 2. * Matrix{Float64}(I, p, p)\nε = MvNormal(zeros(p), H)\n# Simulate vehicle trajectory\nα = zeros(n + 1, m)\ny = zeros(n, p)\nfor t in 1:n\n    y[t, :] = Z * α[t, :] + rand(ε)\n    α[t + 1, :] = T * α[t, :] + R * rand(η)  \nend","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"An illustration of the results can be seen in the following figure. It can be seen that the measurements are reasonably noisy when compared to the true position. Furthermore, the estimated positions, represented by the smoothed state, effectively estimate the true positions with small inaccuracies.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"(Image: Vehicle tracking)","category":"page"},{"location":"manual/#Manual-1","page":"Manual","title":"Manual","text":"","category":"section"},{"location":"manual/#Introduction-1","page":"Manual","title":"Introduction","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"In this package we consider the following state-space model","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        y_t = Z_t alpha_t  + varepsilon_t quad quad quad t = 1 dots n \n        alpha_t+1 = T alpha_t + R eta_t\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"where","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"beginbmatrix\n    varepsilon_t \n    eta_t \n    alpha_1\nendbmatrix\nsim\nNID\nbeginpmatrix\n    beginbmatrix\n        0 \n        0 \n        a_1\n    endbmatrix\n    \n    beginbmatrix\n        H  0  0\n        0  Q  0\n        0  0  P_1\n    endbmatrix\nendpmatrix","category":"page"},{"location":"manual/#Data-structures-1","page":"Manual","title":"Data structures","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceDimensions\nStateSpaceModel\nStateSpaceCovariance\nSmoothedState\nFilterOutput\nStateSpace","category":"page"},{"location":"manual/#StateSpaceModels.StateSpaceDimensions","page":"Manual","title":"StateSpaceModels.StateSpaceDimensions","text":"StateSpaceDimensions\n\nStateSpaceModel dimensions, following the notation of on the book \"Time Series Analysis by State Space Methods\" (2012) by J. Durbin and S. J. Koopman.\n\nn is the number of observations\np is the dimension of the observation vector y_t\nm is the dimension of the state vector alpha_t\nr is the dimension of the state covariance matrix Q\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.StateSpaceModel","page":"Manual","title":"StateSpaceModels.StateSpaceModel","text":"StateSpaceModel{Typ}\n\nFollowing the notation of on the book \"Time Series Analysis by State Space Methods\" (2012) by J. Durbin and S. J. Koopman.\n\ny A n times p matrix containing observations\nZ A p times m times n matrix\nT A m times m matrix\nR A m times r matrix\n\nA StateSpaceModel object can be defined using StateSpaceModel(y::Matrix{Typ}, Z::Array{Typ, 3}, T::Matrix{Typ}, R::Matrix{Typ}).\n\nAlternatively, if Z is time-invariant, it can be input as a single p times m matrix.\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.StateSpaceCovariance","page":"Manual","title":"StateSpaceModels.StateSpaceCovariance","text":"StateSpaceCovariance\n\nFollowing the notation of on the book \"Time Series Analysis by State Space Methods\" (2012) by J. Durbin and S. J. Koopman.\n\nH Covariance matrix of the observation vector\nQ Covariance matrix of the state vector\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.SmoothedState","page":"Manual","title":"StateSpaceModels.SmoothedState","text":"SmoothedState\n\nFollowing the notation of on the book \"Time Series Analysis by State Space Methods\" (2012) by J. Durbin and S. J. Koopman.\n\nalpha Expected value of the smoothed state E(alpha_ty_1 dots  y_n)\nV Error covariance matrix of smoothed state Var(alpha_ty_1 dots  y_n)\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.FilterOutput","page":"Manual","title":"StateSpaceModels.FilterOutput","text":"FilterOutput\n\nFollowing the notation of on the book \"Time Series Analysis by State Space Methods\" (2012) by J. Durbin and S. J. Koopman.\n\na Predictive state E(alpha_ty_t-1 dots  y_1)\natt Filtered state E(alpha_ty_t dots  y_1)\nv Prediction error v_t = y_t  Z_t a_t\nP Covariance matrix of predictive state P = Var(alpha_ty_t1 dots  y_1)\nPtt Covariance matrix of filtered state P = Var(alpha_ty_t dots  y_1)\nF Variance of prediction error Var(v_t)\nsteadystate Boolean to indicate if steady state was attained\ntsteady Instant when steady state was attained; in case it was not, tsteady = n+1\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.StateSpace","page":"Manual","title":"StateSpaceModels.StateSpace","text":"StateSpace\n\nA state-space structure containing the model, filter output, smoother output, covariance matrices, filter type and optimization method.\n\n\n\n\n\n","category":"type"},{"location":"manual/#Predefined-models-1","page":"Manual","title":"Predefined models","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"The local level model is defined by","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        y_t =  mu_t  + varepsilon_t quad varepsilon_t sim mathcalN(0 sigma^2_varepsilon)\n        mu_t+1 = mu_t + eta_t quad eta_t sim mathcalN(0 sigma^2_eta)\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"local_level","category":"page"},{"location":"manual/#StateSpaceModels.local_level","page":"Manual","title":"StateSpaceModels.local_level","text":"local_level(y::VecOrMat{Typ}) where Typ <: AbstractFloat\n\nBuild state-space system for a local level model with observations y.\n\nIf y is proided as an Array{Typ, 1} it will be converted to an Array{Typ, 2} inside the StateSpaceModel.\n\n\n\n\n\n","category":"function"},{"location":"manual/#","page":"Manual","title":"Manual","text":"The linear trend model is defined by","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        y_t =  mu_t  + varepsilon_t quad varepsilon_t sim mathcalN(0 sigma^2_varepsilon)\n        mu_t+1 = mu_t + nu_t + xi_t quad xi_t sim mathcalN(0 sigma^2_xi)\n        nu_t+1 = nu_t + zeta_t quad zeta_t sim mathcalN(0 sigma^2_zeta)\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"linear_trend","category":"page"},{"location":"manual/#StateSpaceModels.linear_trend","page":"Manual","title":"StateSpaceModels.linear_trend","text":"linear_trend(y::VecOrMat{Typ}) where Typ <: AbstractFloat\n\nBuild state-space system for a linear trend model with observations y.\n\nIf y is proided as an Array{Typ, 1} it will be converted to an Array{Typ, 2} inside the StateSpaceModel.\n\n\n\n\n\n","category":"function"},{"location":"manual/#","page":"Manual","title":"Manual","text":"The structural model is defined by","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"<!– TODO mathematical model –>","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"structural","category":"page"},{"location":"manual/#StateSpaceModels.structural","page":"Manual","title":"StateSpaceModels.structural","text":"structural(y::VecOrMat{Typ}, s::Int; X::VecOrMat{Typ} = Matrix{Typ}(undef, 0, 0)) where Typ <: AbstractFloat\n\nBuild state-space system for a given structural model with observations y, seasonality s, and, optionally, exogenous variables X.\n\nIf y is provided as an Array{Typ, 1} it will be converted to an Array{Typ, 2} inside the StateSpaceModel. The same will happen to X,  if an Array{Typ, 1} it will be converted to an Array{Typ, 2} inside the StateSpaceModel.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Estimation-1","page":"Manual","title":"Estimation","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"The model estimation is made using the function statespace(model; filter_type = KalmanFilter, optimization_method = RandomSeedsLBFGS(), verbose = 1). It receives as argument the pre-specified StateSpaceModel object model. Optionally, the user can define the Kalman filter variant to be used, the optimization method and the verbosity level.","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"statespace","category":"page"},{"location":"manual/#StateSpaceModels.statespace","page":"Manual","title":"StateSpaceModels.statespace","text":"statespace(model::StateSpaceModel; filter_type::DataType = KalmanFilter, optimization_method::AbstractOptimizationMethod = RandomSeedsLBFGS(), verbose::Int = 1)\n\nEstimate the pre-specified state-space model.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Forecasting-1","page":"Manual","title":"Forecasting","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"Forecasting is conducted with the function forecast. It receives as argument a StateSpace object and the number of steps ahead N.","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"forecast","category":"page"},{"location":"manual/#StateSpaceModels.forecast","page":"Manual","title":"StateSpaceModels.forecast","text":"forecast(ss::StateSpace, N::Int)\n\nObtain the minimum mean square error forecasts N steps ahead. Returns the forecasts and the predictive distributions  at each time period.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Simulation-1","page":"Manual","title":"Simulation","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"Simulation is made using the function simulate. It receives as argument a StateSpace object, the number of steps ahead N and the number of scenarios to simulate S.","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"simulate","category":"page"},{"location":"manual/#StateSpaceModels.simulate","page":"Manual","title":"StateSpaceModels.simulate","text":"simulate(ss::StateSpace, N::Int, S::Int)\n\nSimulate S future scenarios up to N steps ahead. Returns a p x N x S matrix where the dimensions represent, respectively, the number of series in the model, the number of steps ahead, and the number of scenarios.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Filters-1","page":"Manual","title":"Filters","text":"","category":"section"},{"location":"manual/#Kalman-Filter-1","page":"Manual","title":"Kalman Filter","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"The implementation of the Kalman Filter follows the recursion","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        v_t = y_t - Z_t a_t  F_t = Z_t P_t Z^top_t + H\n        a_tt = a_t - P_t Z^top_t F_t^-1 v_t quad quad quad P_tt = P_t -  P_t Z^top_t F_t^-1Z_t P_t\n        a_t+1 = T a_t - K_t v_t quad quad quad P_t+1 = T P_t(T - K_t Z_t)^top + R Q R\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"where K_t = T P_t Z^top_t F_t^-1. The terms a_t+1 and P_t+1 can be simplifed to ","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        a_t+1 = T a_ttquad quad quad P_t+1 = T P_tt T^top + R Q R\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"In case of missing observation the mean of inovations v_t and variance of inovations F_t become NaN and the recursion becomes ","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        a_tt = a_t quad quad quad P_tt = P_t\n        a_t+1 = T a_t quad quad quad P_t+1 = T P_t T^top + R Q R\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.kalman_filter","category":"page"},{"location":"manual/#StateSpaceModels.kalman_filter","page":"Manual","title":"StateSpaceModels.kalman_filter","text":"kalman_filter(model::StateSpaceModel, H::Matrix{Typ}, Q::Matrix{Typ}; tol::Typ = 1e-5) where Typ <: AbstractFloat\n\nKalman filter with big Kappa initialization, i.e., initializing state variances as 1e6.\n\n\n\n\n\n","category":"function"},{"location":"manual/#","page":"Manual","title":"Manual","text":"The implementation of the smoother follows the recursion","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        r_t-1 = Z^top_t F_t^-1 v_t + L^top_t r_t quad quad  N_t-1 = Z^top_t F_t^-1 Z_t + L^top_t N_t L_t\n        alpha_t = a_t + P_t r_t  V_t = P_t - P_t N_t-1 P_t  \n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"where L_t = T - K_t Z_t.","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"In case of missing observation then r_t-1 and N_t-1 become ","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"begingather*\n    beginaligned\n        r_t-1 = T^top r_t quad quad  N_t-1 = T^top_t N_t T_t\n    endaligned\nendgather*","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.smoother","category":"page"},{"location":"manual/#StateSpaceModels.smoother","page":"Manual","title":"StateSpaceModels.smoother","text":"smoother(model::StateSpaceModel, kfilter::KalmanFilter)\n\nSmoother for state-space model.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Square-Root-Kalman-Filter-1","page":"Manual","title":"Square Root Kalman Filter","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.sqrt_kalman_filter\nStateSpaceModels.sqrt_smoother\nStateSpaceModels.filtered_state","category":"page"},{"location":"manual/#StateSpaceModels.sqrt_kalman_filter","page":"Manual","title":"StateSpaceModels.sqrt_kalman_filter","text":"sqrt_kalman_filter(model::StateSpaceModel, sqrtH::Matrix{Typ}, sqrtQ::Matrix{Typ}; tol::Typ = 1e-5) where Typ <: AbstractFloat\n\nSquare-root Kalman filter with big Kappa initialization.\n\n\n\n\n\n","category":"function"},{"location":"manual/#StateSpaceModels.sqrt_smoother","page":"Manual","title":"StateSpaceModels.sqrt_smoother","text":"sqrt_smoother(model::StateSpaceModel, sqrt_filter::SquareRootFilter)\n\nSquare-root smoother for state space model.\n\n\n\n\n\n","category":"function"},{"location":"manual/#StateSpaceModels.filtered_state","page":"Manual","title":"StateSpaceModels.filtered_state","text":"filtered_state(model::StateSpaceModel, sqrt_filter::SquareRootFilter)\n\nObtain the filtered state estimates and their covariance matrices.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Filter-interface-1","page":"Manual","title":"Filter interface","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels has an interface that allows users to define their own versions of the Kalman filter.","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.AbstractFilter\nStateSpaceModels.AbstractSmoother\nkfas","category":"page"},{"location":"manual/#StateSpaceModels.AbstractFilter","page":"Manual","title":"StateSpaceModels.AbstractFilter","text":"AbstractFilter\n\nAbstract type used to implement an interface for generic filters.\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.AbstractSmoother","page":"Manual","title":"StateSpaceModels.AbstractSmoother","text":"AbstractSmoother\n\nAbstract type used to implement an interface for generic smoothers.\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.kfas","page":"Manual","title":"StateSpaceModels.kfas","text":"kfas(model::StateSpaceModel, covariance::StateSpaceCovariance,\n     filter_type::DataType)\n\nPerform kalman filter and smoother according to the chosen filter_type.\n\n\n\n\n\n","category":"function"},{"location":"manual/#","page":"Manual","title":"Manual","text":"Every filter must provide its own version of the statespace_likelihood function","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.statespace_likelihood","category":"page"},{"location":"manual/#StateSpaceModels.statespace_likelihood","page":"Manual","title":"StateSpaceModels.statespace_likelihood","text":"statespace_likelihood(psitilde::Vector{T}, model::StateSpaceModel) where T <: AbstractFloat\n\nCompute log-likelihood concerning hyperparameter vector psitilde (psi)\n\nEvaluate ell(psiy_n)= -fracnp2log2pi - frac12 sum_t=1^n log F_t -  frac12 sum_t=1^n v_t^top F_t^-1 v_t\n\n\n\n\n\n","category":"function"},{"location":"manual/#Optimization-methods-1","page":"Manual","title":"Optimization methods","text":"","category":"section"},{"location":"manual/#RandomSeedsLBFGS-1","page":"Manual","title":"RandomSeedsLBFGS","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.RandomSeedsLBFGS","category":"page"},{"location":"manual/#StateSpaceModels.RandomSeedsLBFGS","page":"Manual","title":"StateSpaceModels.RandomSeedsLBFGS","text":"TODO\n\n\n\n\n\n","category":"type"},{"location":"manual/#Optimization-methods-interface-1","page":"Manual","title":"Optimization methods interface","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"StateSpaceModels.AbstractOptimizationMethod\nStateSpaceModels.estimate_statespace","category":"page"},{"location":"manual/#StateSpaceModels.AbstractOptimizationMethod","page":"Manual","title":"StateSpaceModels.AbstractOptimizationMethod","text":"AbstractOptimizationMethod\n\nAbstract type used to implement an interface for generic optimization methods.\n\n\n\n\n\n","category":"type"},{"location":"manual/#StateSpaceModels.estimate_statespace","page":"Manual","title":"StateSpaceModels.estimate_statespace","text":"estimate_statespace(model::StateSpaceModel, filter_type::DataType,\n                    optimization_method::AbstractOptimizationMethod; verbose::Int = 1)\n\nEstimate parameters of the StateSpaceModel according to its filter_type and optimization_method.\n\n\n\n\n\n","category":"function"},{"location":"manual/#Diagnostics-1","page":"Manual","title":"Diagnostics","text":"","category":"section"},{"location":"manual/#","page":"Manual","title":"Manual","text":"After the estimation is completed, diagnostics can be run over the residuals. The implemented diagnostics include the Jarque-Bera normality test, the Ljung-Box independence test, and a homoscedasticity test.","category":"page"},{"location":"manual/#","page":"Manual","title":"Manual","text":"diagnostics\nStateSpaceModels.residuals\nStateSpaceModels.jarquebera\nStateSpaceModels.ljungbox\nStateSpaceModels.homoscedast","category":"page"},{"location":"manual/#StateSpaceModels.diagnostics","page":"Manual","title":"StateSpaceModels.diagnostics","text":"diagnostics(ss::StateSpace)\n\nRun diagnostics and print results\n\n\n\n\n\n","category":"function"},{"location":"manual/#StateSpaceModels.residuals","page":"Manual","title":"StateSpaceModels.residuals","text":"residuals(ss::StateSpace)\n\nObtain standardized residuals from a state-space model\n\n\n\n\n\n","category":"function"},{"location":"manual/#StateSpaceModels.jarquebera","page":"Manual","title":"StateSpaceModels.jarquebera","text":"jarquebera(e::Matrix{T})\n\nRun Jarque-Bera normality test and return p-values\n\n\n\n\n\n","category":"function"},{"location":"manual/#StateSpaceModels.ljungbox","page":"Manual","title":"StateSpaceModels.ljungbox","text":"ljungbox(e::Matrix{T}; maxlag = 20)\n\nRun Ljung-Box independence test and return p-values\n\n\n\n\n\n","category":"function"},{"location":"manual/#StateSpaceModels.homoscedast","page":"Manual","title":"StateSpaceModels.homoscedast","text":"homoscedast(e::Matrix{T})\n\nRun homoscedasticity test and return p-values\n\n\n\n\n\n","category":"function"},{"location":"reference/#Reference-1","page":"Reference","title":"Reference","text":"","category":"section"},{"location":"reference/#","page":"Reference","title":"Reference","text":"size\nztr\nStateSpaceModels.check_steady_state\nStateSpaceModels.ensure_pos_sym!\nStateSpaceModels.prepare_forecast","category":"page"},{"location":"reference/#Base.size","page":"Reference","title":"Base.size","text":"size(model::StateSpaceModel)\n\nReturn the dimensions n, p, m and r of the StateSpaceModel\n\n\n\n\n\n","category":"function"},{"location":"reference/#StateSpaceModels.ztr","page":"Reference","title":"StateSpaceModels.ztr","text":"ztr(model::StateSpaceModel)\n\nReturn the state space model arrays Z, T and R of the StateSpaceModel\n\n\n\n\n\n","category":"function"},{"location":"reference/#StateSpaceModels.check_steady_state","page":"Reference","title":"StateSpaceModels.check_steady_state","text":"check_steady_state(P_t1::Matrix{T}, P_t::Matrix{T}, tol::T) where T <: AbstractFloat\n\nReturn true if steady state was attained with respect to tolerance tol, false otherwise. The steady state is checked by the following equation. TODO\n\n\n\n\n\n","category":"function"},{"location":"reference/#StateSpaceModels.ensure_pos_sym!","page":"Reference","title":"StateSpaceModels.ensure_pos_sym!","text":"ensure_pos_sym!(M::Matrix{T}; ϵ::T = 1e-8) where T <: AbstractFloat\n\nEnsure that matrix M is positive and symmetric to avoid numerical errors when numbers are small by doing (M + M')/2 + ϵ*I\n\n\n\n\n\n","category":"function"},{"location":"reference/#StateSpaceModels.prepare_forecast","page":"Reference","title":"StateSpaceModels.prepare_forecast","text":"prepare_forecast(ss::StateSpace, N::Int)\n\nAdjust matrix Z for forecasting and check for dimension errors.\n\n\n\n\n\n","category":"function"},{"location":"#StateSpaceModels.jl-Documentation-1","page":"Home","title":"StateSpaceModels.jl Documentation","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"StateSpaceModels.jl is a package for modeling, forecasting, and simulating time series in a state-space framework. Implementations were made based on the book \"Time Series Analysis by State Space Methods\" (2012) by James Durbin and Siem Jan Koopman. The notation of the variables in the code also follows the book.","category":"page"},{"location":"#Installation-1","page":"Home","title":"Installation","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"This package is registered in METADATA so you can Pkg.add it as follows:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"pkg> add StateSpaceModels","category":"page"},{"location":"#Features-1","page":"Home","title":"Features","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Current features:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Kalman filter and smoother\nSquare-root filter and smoother\nMaximum likelihood estimation\nForecasting\nMonte Carlo simulation\nMultivariate modeling\nUser-defined models (input any Z, T, and R)\nSeveral predefined models, including:\nBasic structural model (trend, slope, seasonal)\nStructural model with exogenous variables\nLinear trend model\nLocal level model\nCompletion of missing values\nDiagnostics for the residuals, including:\nJarque-Bera test\nLjung-Box test\nHomoscedasticity test","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Planned features:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Exact initialization of the Kalman filter\nEM algorithm for maximum likelihood estimation\nUnivariate treatment of multivariate models","category":"page"},{"location":"#Citing-StateSpaceModels.jl-1","page":"Home","title":"Citing StateSpaceModels.jl","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"If you use StateSpaceModels.jl in your work, we kindly ask you to cite the following paper (pdf):","category":"page"},{"location":"#","page":"Home","title":"Home","text":"@article{SaavedraBodinSouto2019,\ntitle={StateSpaceModels.jl: a Julia Package for Time-Series Analysis in a State-Space Framework},\nauthor={Raphael Saavedra and Guilherme Bodin and Mario Souto},\njournal={arXiv preprint arXiv:1908.01757},\nyear={2019}\n}","category":"page"}]
}
