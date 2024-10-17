use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use aligned_sdk::core::types::{Network, PriceEstimate, ProvingSystemId, VerificationData};
use aligned_sdk::sdk::{estimate_fee, get_next_nonce, submit_and_wait_verification};
use dotenv::dotenv;
use ethers::signers::{LocalWallet, Signer};
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::env;
use std::str::FromStr;

const BATCHER_URL: &str = "wss://batcher.alignedlayer.com";
const NETWORK: Network = Network::Holesky;

#[derive(Deserialize)]
struct VerificationRequest {
    proof: Vec<u8>,
    _verification_key: Vec<u8>,
    _pub_input: Vec<u8>,
}

#[derive(Serialize)]
struct VerificationResponse {
    success: bool,
    error: Option<String>,
}

async fn verify_proof(
    verification_data: VerificationData,
    rpc_url: &str,
    wallet: &LocalWallet,
) -> Result<Option<String>, Box<dyn std::error::Error>> {
    let nonce = get_next_nonce(rpc_url, wallet.address(), NETWORK)
        .await
        .expect("Failed to get next nonce");
    let max_fee = estimate_fee(&rpc_url, PriceEstimate::Default)
        .await
        .expect("failed to fetch gas price from the blockchain");

    match submit_and_wait_verification(
        BATCHER_URL,
        &rpc_url,
        NETWORK,
        &verification_data,
        max_fee,
        wallet.clone(),
        nonce,
    )
    .await
    {
        Ok(aligned_verification_data) => {
            let batch_root = hex::encode(aligned_verification_data.batch_merkle_root);
            info!("Verification successful. Batch root: {}", batch_root);
            Ok(None)
        }
        Err(e) => {
            error!("Verification error: {}", e);
            Ok(Some(e.to_string()))
        }
    }
}

async fn verify_handler(
    req: web::Json<VerificationRequest>,
    wallet: web::Data<LocalWallet>,
    rpc_url: web::Data<String>,
) -> Result<HttpResponse, actix_web::Error> {
    let req = req.into_inner();

    let verification_data = VerificationData {
        proving_system: ProvingSystemId::Groth16Bn254,
        proof: req.proof,
        pub_input: None,
        verification_key: None,
        vm_program_code: None,
        proof_generator_addr: wallet.address(),
    };

    match verify_proof(verification_data, &rpc_url, &wallet).await {
        Ok(error) => Ok(HttpResponse::Ok().json(VerificationResponse {
            success: error.is_none(),
            error,
        })),
        Err(e) => Ok(
            HttpResponse::InternalServerError().json(VerificationResponse {
                success: false,
                error: Some(e.to_string()),
            }),
        ),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let rpc_url = env::var("RPC_URL").expect("RPC_URL must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");

    let wallet = LocalWallet::from_str(&private_key)
        .expect("Failed to create wallet")
        .with_chain_id(17000u64);

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(wallet.clone()))
            .app_data(web::Data::new(rpc_url.clone()))
            .wrap(middleware::Logger::default())
            .service(web::resource("/verify").route(web::post().to(verify_handler)))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
