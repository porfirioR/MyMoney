package com.data.mymoney

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.FirebaseFirestore


class MainActivity : AppCompatActivity() {

    var myFbTextView: TextView? = null

    var database = FirebaseDatabase.getInstance()
    var myRef = database.getReference("ingreso-gasto")
    var db = FirebaseFirestore.getInstance()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        myFbTextView = findViewById<TextView>(R.id.textView)
    }

    override fun onStart() {
        super.onStart()
        myRef.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(dataSnapshot: DataSnapshot) {
                val value = dataSnapshot.value.toString()
                myFbTextView?.text = value
            }

            override fun onCancelled(error: DatabaseError) {
            }
        })

        db.collection("category")
            .get()
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    for (document in task.result) {
                        val aux = document.id + " => " + document.data["value"]
                        myFbTextView?.text = aux
                    }
                } else {
                    val message = "Error getting documents." + task.exception
                }
            }


    }

}